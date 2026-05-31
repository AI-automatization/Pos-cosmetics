import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { nasiyaApi } from '../../api/nasiya.api';
import { extractErrorMessage } from '../../utils/error';
import {
  newDebtSchema,
  extractFieldErrors,
  type NewDebtFieldErrors,
} from '../../validation/nasiya.schema';
import ProductsList from './ProductsList';
import DebtFormFields from './DebtFormFields';
import { styles, C } from './NewDebtSheet.styles';

interface ProductItem {
  product: { id: string; name: string; sellPrice: number };
  qty: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialAmount?: number;
  initialProducts?: ProductItem[];
}

interface FormState {
  customerName: string;
  phone: string;
  totalAmount: string;
  dueDate: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  customerName: '',
  phone:        '',
  totalAmount:  '',
  dueDate:      '',
  notes:        '',
};

export default function NewDebtSheet({
  visible, onClose, onSuccess,
  initialAmount, initialProducts,
}: Props) {
  const [form, setForm]       = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<NewDebtFieldErrors>({});

  React.useEffect(() => {
    if (visible) {
      setFieldErrors({});
      if (initialAmount !== undefined && initialAmount > 0) {
        setForm({ ...EMPTY_FORM, totalAmount: String(initialAmount) });
      } else {
        setForm(EMPTY_FORM);
      }
    } else {
      setForm(EMPTY_FORM);
      setFieldErrors({});
    }
  }, [visible, initialAmount, initialProducts]);

  const setField = useCallback(
    (key: keyof FormState) => (value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const resetAndClose = useCallback(() => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    onClose();
  }, [onClose]);

  const handleSave = useCallback(async () => {
    const result = newDebtSchema.safeParse({
      customerName: form.customerName.trim(),
      phone:        form.phone.trim() || undefined,
      totalAmount:  form.totalAmount,
      dueDate:      form.dueDate.trim() || undefined,
      notes:        form.notes.trim() || undefined,
    });

    if (!result.success) {
      setFieldErrors(extractFieldErrors(result.error));
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      await nasiyaApi.create({
        customerName: result.data.customerName,
        phone:        result.data.phone,
        totalAmount:  result.data.totalAmount,
        dueDate:      result.data.dueDate,
        notes:        result.data.notes,
      });
      setForm(EMPTY_FORM);
      onSuccess();
    } catch (err) {
      Alert.alert('Xatolik', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [form, onSuccess]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={resetAndClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.kav}
          >
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.title}>Yangi nasiya</Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {initialProducts && initialProducts.length > 0 && (
                  <ProductsList items={initialProducts} />
                )}
                <DebtFormFields
                  form={form}
                  onChangeField={setField}
                  disabled={loading}
                  errors={fieldErrors}
                />
              </ScrollView>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={resetAndClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelBtnText}>Bekor</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, loading && styles.btnDisabled]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={C.white} size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Saqlash</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

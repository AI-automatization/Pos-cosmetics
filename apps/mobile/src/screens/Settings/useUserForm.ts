import { useState, useEffect, useCallback } from 'react';
import { AppUser, UserRole } from './UserCard';
import { CreateUserBody } from '../../api/users.api';
import { userSchema, extractFieldErrors } from '../../validation/user.schema';

interface UseUserFormArgs {
  readonly visible: boolean;
  readonly user: AppUser | null;
  readonly onSave: (body: CreateUserBody) => void;
}

interface UseUserForm {
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly password: string;
  readonly role: UserRole;
  readonly fieldErrors: Record<string, string>;
  readonly isNew: boolean;
  readonly onFirstNameChange: (text: string) => void;
  readonly onLastNameChange: (text: string) => void;
  readonly onPhoneChange: (text: string) => void;
  readonly onPasswordChange: (text: string) => void;
  readonly setRole: (role: UserRole) => void;
  readonly handleSave: () => void;
}

/**
 * UserFormSheet uchun form state, maydon handlerlari va validatsiya logikasi.
 * Sheet ochilganda (visible=true) maydonlar tanlangan user bilan to'ldiriladi.
 */
export function useUserForm({ visible, user, onSave }: UseUserFormArgs): UseUserForm {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState<UserRole>('CASHIER');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isNew = !user;

  useEffect(() => {
    if (visible) {
      setFirstName(user?.firstName ?? '');
      setLastName(user?.lastName ?? '');
      setPhone(user?.phone ?? '');
      setPassword('');
      setRole(user?.role ?? 'CASHIER');
      setFieldErrors({});
    }
  }, [visible, user]);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const onFirstNameChange = useCallback((text: string) => {
    setFirstName(text);
    clearFieldError('firstName');
  }, [clearFieldError]);

  const onLastNameChange = useCallback((text: string) => {
    setLastName(text);
    clearFieldError('lastName');
  }, [clearFieldError]);

  const onPhoneChange = useCallback((text: string) => {
    setPhone(text);
    clearFieldError('phone');
  }, [clearFieldError]);

  const onPasswordChange = useCallback((text: string) => {
    setPassword(text);
    clearFieldError('password');
  }, [clearFieldError]);

  const handleSave = useCallback(() => {
    const formData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: '',
      phone: phone.trim() || undefined,
      password: password || undefined,
      role,
    };

    const result = userSchema.safeParse(formData);

    if (!result.success) {
      const errors = extractFieldErrors(result.error);

      // Yangi user uchun parol majburiy -- zod schema da optional bo'lgani uchun alohida tekshiramiz
      if (isNew && !password.trim()) {
        errors.password = 'Parol kiritilishi shart';
      }

      setFieldErrors(errors);
      return;
    }

    // Yangi user uchun parol majburiy -- alohida tekshiruv
    if (isNew && !password.trim()) {
      setFieldErrors({ password: 'Parol kiritilishi shart' });
      return;
    }

    setFieldErrors({});
    onSave({
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      email: result.data.email ?? '',
      phone: result.data.phone || undefined,
      password,
      role,
    });
  }, [firstName, lastName, phone, password, role, isNew, onSave]);

  return {
    firstName,
    lastName,
    phone,
    password,
    role,
    fieldErrors,
    isNew,
    onFirstNameChange,
    onLastNameChange,
    onPhoneChange,
    onPasswordChange,
    setRole,
    handleSave,
  };
}

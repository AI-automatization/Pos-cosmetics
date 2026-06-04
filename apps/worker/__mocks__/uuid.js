'use strict';
// CJS stub for uuid used only in Jest (bullmq CJS dist requires uuid which is ESM-only in v14)
let counter = 0;
const v4 = () => `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`;
module.exports = { v4, v1: v4, v3: v4, v5: v4, v6: v4, v7: v4 };

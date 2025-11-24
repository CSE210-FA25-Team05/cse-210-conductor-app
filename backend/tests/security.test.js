// tests for backend/src/security.js
const {
  isStrongPassword,
  sanitizeInput,
  hasRequiredRole,
} = require('../src/security');

describe('isStrongPassword', () => {
  test('rejects short passwords', () => {
    expect(isStrongPassword('Ab1!')).toBe(false);
  });

  test('accepts a long complex password', () => {
    expect(isStrongPassword('StrongPassw0rd!')).toBe(true);
  });

  test('rejects non-string input (number)', () => {
    expect(isStrongPassword(12345678901111)).toBe(false);
  });

  test('rejects non-string input (null)', () => {
    expect(isStrongPassword(null)).toBe(false);
  });

  test('rejects non-string input (undefined)', () => {
    expect(isStrongPassword(undefined)).toBe(false);
  });

  test('rejects non-string input (object)', () => {
    expect(isStrongPassword({ password: 'StrongPassw0rd!' })).toBe(false);
  });

  test('rejects non-string input (array)', () => {
    expect(isStrongPassword(['StrongPassw0rd!'])).toBe(false);
  });

  test('rejects password with exactly 11 characters (boundary)', () => {
    expect(isStrongPassword('StrongP@ss1')).toBe(false);
  });

  test('accepts password with exactly 12 characters (boundary)', () => {
    expect(isStrongPassword('StrongP@ssw1')).toBe(true);
  });

  test('accepts very long password', () => {
    expect(isStrongPassword('LongP@ssw0rd' + '!'.repeat(1024))).toBe(true);
  });

  test('rejects empty string', () => {
    expect(isStrongPassword('')).toBe(false);
  });

  test('rejects password without uppercase letters', () => {
    expect(isStrongPassword('strongpassw0rd!')).toBe(false);
  });

  test('rejects password without lowercase letters', () => {
    expect(isStrongPassword('STRONGPASSW0RD!')).toBe(false);
  });

  test('rejects password without digits', () => {
    expect(isStrongPassword('StrongPassword!')).toBe(false);
  });

  test('rejects password without symbol', () => {
    expect(isStrongPassword('StrongPassw0rd')).toBe(false);
  });

  test('accepts password with various special characters', () => {
    expect(isStrongPassword('P@ssw0rd!#$%')).toBe(true);
  });

  test('accepts password with underscore as symbol', () => {
    expect(isStrongPassword('Strong_Passw0rd')).toBe(true);
  });

  test('accepts password with hyphen as symbol', () => {
    expect(isStrongPassword('Strong-Passw0rd1')).toBe(true);
  });

  test('accepts password with space as symbol', () => {
    expect(isStrongPassword('Strong Passw0rd1')).toBe(true);
  });

  test('rejects password with only spaces (even if long)', () => {
    expect(isStrongPassword('            ')).toBe(false);
  });

  test('accepts password with unicode characters as symbols', () => {
    expect(isStrongPassword('StrongPäss™0rd1你好🌍')).toBe(true);
  });
});

describe('sanitizeInput', () => {
  test('removes angle brackets used in HTML tags', () => {
    const input = '<script>alert(1)</script>';
    const output = sanitizeInput(input);
    expect(output).not.toMatch(/[<>]/);
  });

  test('returns empty string for non-string input (number)', () => {
    expect(sanitizeInput(12345)).toBe('');
  });

  test('returns empty string for non-string input (null)', () => {
    expect(sanitizeInput(null)).toBe('');
  });

  test('returns empty string for non-string input (undefined)', () => {
    expect(sanitizeInput(undefined)).toBe('');
  });

  test('returns empty string for non-string input (object)', () => {
    expect(sanitizeInput({ text: 'hello' })).toBe('');
  });

  test('returns empty string for non-string input (array)', () => {
    expect(sanitizeInput(['hello'])).toBe('');
  });

  test('returns empty string for boolean input', () => {
    expect(sanitizeInput(true)).toBe('');
  });

  test('returns empty string for empty string input', () => {
    expect(sanitizeInput('')).toBe('');
  });

  test('preserves normal text without angle brackets', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World');
  });

  test('preserves text with special characters except angle brackets', () => {
    expect(sanitizeInput('Hello! @#$ %^& *()')).toBe('Hello! @#$ %^& *()');
  });

  test('preserves text with unicode and international characters except angle brackets', () => {
    expect(sanitizeInput('Hello 世界ä™ 🌍')).toBe('Hello 世界ä™ 🌍');
  });

  test('removes multiple opening angle brackets', () => {
    const input = '<<<script>';
    const output = sanitizeInput(input);
    expect(output).toBe('script');
    expect(output).not.toMatch(/[<>]/);
  });

  test('removes multiple closing angle brackets', () => {
    const input = 'script>>>';
    const output = sanitizeInput(input);
    expect(output).toBe('script');
    expect(output).not.toMatch(/[<>]/);
  });

  test('sanitizes self-closing tags', () => {
    const input = '<img src="x" />';
    const output = sanitizeInput(input);
    expect(output).not.toMatch(/[<>]/);
  });

  test('sanitizes HTML with attributes', () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const output = sanitizeInput(input);
    expect(output).not.toMatch(/[<>]/);
  });

  test('handles input with only angle brackets', () => {
    expect(sanitizeInput('<>')).toBe('');
    expect(sanitizeInput('<<<>>>')).toBe('');
  });

  test('preserves whitespace in normal text', () => {
    expect(sanitizeInput('Hello   World')).toBe('Hello   World');
  });

  test('preserves newlines', () => {
    expect(sanitizeInput('Line1\nLine2')).toBe('Line1\nLine2');
  });

  test('preserves tabs', () => {
    expect(sanitizeInput('Column1\tColumn2')).toBe('Column1\tColumn2');
  });
});

describe('hasRequiredRole', () => {
  test('returns true when user has the role', () => {
    const user = { roles: ['user', 'admin'] };
    expect(hasRequiredRole(user, 'admin')).toBe(true);
  });

  test('returns false when user does not have the role', () => {
    const user = { roles: ['user'] };
    expect(hasRequiredRole(user, 'admin')).toBe(false);
  });

  test('handles missing user object', () => {
    expect(hasRequiredRole(null, 'admin')).toBe(false);
  });

  test('returns false when user is undefined', () => {
    expect(hasRequiredRole(undefined, 'admin')).toBe(false);
  });

  test('returns false when user is empty object', () => {
    expect(hasRequiredRole({}, 'admin')).toBe(false);
  });

  test('returns false when user.roles is not an array', () => {
    const user = { roles: 'admin' };
    expect(hasRequiredRole(user, 'admin')).toBe(false);
  });

  test('returns false when user.roles is null', () => {
    const user = { roles: null };
    expect(hasRequiredRole(user, 'admin')).toBe(false);
  });

  test('returns false when user.roles is undefined', () => {
    const user = { roles: undefined };
    expect(hasRequiredRole(user, 'admin')).toBe(false);
  });

  test('returns false when user.roles is a number', () => {
    const user = { roles: 123 };
    expect(hasRequiredRole(user, 'admin')).toBe(false);
  });

  test('returns false when user has empty roles array', () => {
    const user = { roles: [] };
    expect(hasRequiredRole(user, 'admin')).toBe(false);
  });

  test('returns true when requiredRole is null', () => {
    const user = { roles: ['user'] };
    expect(hasRequiredRole(user, null)).toBe(true);
  });

  test('returns true when requiredRole is undefined', () => {
    const user = { roles: ['user'] };
    expect(hasRequiredRole(user, undefined)).toBe(true);
  });

  test('returns true when requiredRole is empty string', () => {
    const user = { roles: ['user'] };
    expect(hasRequiredRole(user, '')).toBe(true);
  });

  test('returns true when requiredRole is falsy (0)', () => {
    const user = { roles: ['user'] };
    expect(hasRequiredRole(user, 0)).toBe(true);
  });

  test('returns true when user has multiple roles including required', () => {
    const user = { roles: ['user', 'admin', 'moderator'] };
    expect(hasRequiredRole(user, 'moderator')).toBe(true);
  });

  test('returns true for first role in array', () => {
    const user = { roles: ['admin', 'user'] };
    expect(hasRequiredRole(user, 'admin')).toBe(true);
  });

  test('returns true for last role in array', () => {
    const user = { roles: ['user', 'moderator', 'admin'] };
    expect(hasRequiredRole(user, 'admin')).toBe(true);
  });

  test('is case-sensitive for role matching', () => {
    const user = { roles: ['Admin'] };
    expect(hasRequiredRole(user, 'admin')).toBe(false);
  });

  test('exact match required for role', () => {
    const user = { roles: ['administrator'] };
    expect(hasRequiredRole(user, 'admin')).toBe(false);
  });

  test('handles role with spaces', () => {
    const user = { roles: ['super admin'] };
    expect(hasRequiredRole(user, 'super admin')).toBe(true);
  });

  test('handles role with special characters', () => {
    const user = { roles: ['admin_level_1'] };
    expect(hasRequiredRole(user, 'admin_level_1')).toBe(true);
  });

  test('handles numeric role values', () => {
    const user = { roles: [1, 2, 3] };
    expect(hasRequiredRole(user, 2)).toBe(true);
  });

  test('handles user with only the required role', () => {
    const user = { roles: ['admin'] };
    expect(hasRequiredRole(user, 'admin')).toBe(true);
  });

  test('returns false when checking for role not in large array', () => {
    const user = { roles: ['role1', 'role2', 'role3', 'role4', 'role5'] };
    expect(hasRequiredRole(user, 'admin')).toBe(false);
  });

  test('works when user has additional properties', () => {
    const user = {
      id: 123,
      name: 'John',
      roles: ['admin'],
      email: 'john@example.com',
    };
    expect(hasRequiredRole(user, 'admin')).toBe(true);
  });

  test('returns false when both user and requiredRole are invalid', () => {
    expect(hasRequiredRole(null, null)).toBe(false);
  });

  test('returns false when user is invalid but requiredRole is empty', () => {
    expect(hasRequiredRole(null, '')).toBe(false);
  });
});

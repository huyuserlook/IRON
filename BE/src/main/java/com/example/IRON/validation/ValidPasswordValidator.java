package com.example.IRON.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidPasswordValidator implements ConstraintValidator<ValidPassword, String> {

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isBlank()) {
            return true; // @NotBlank will handle empty
        }

        boolean hasMinLength = password.length() >= 8;
        boolean hasUpperCase = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowerCase = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars().anyMatch(ch -> "@#$%^&*!".indexOf(ch) >= 0);

        if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecial) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@#$%^&*!)"
            ).addConstraintViolation();
            return false;
        }
        return true;
    }
}

package com.example.IRON.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public static String toSlug(String input) {
        if (input == null) return "";
        String s = input.toLowerCase(Locale.ROOT);
        s = s.replaceAll("[àáâãăạảấầẩẫậắằẳẵặ]", "a");
        s = s.replaceAll("[èéêẹẻẽếềểễệ]", "e");
        s = s.replaceAll("[ìíîïịỉĩ]", "i");
        s = s.replaceAll("[òóôõơọỏốồổỗộớờởỡợ]", "o");
        s = s.replaceAll("[ùúûưụủũứừửữự]", "u");
        s = s.replaceAll("[ỳýỵỷỹ]", "y");
        s = s.replaceAll("[đ]", "d");
        String normalized = Normalizer.normalize(s, Normalizer.Form.NFD);
        String slug = WHITESPACE.matcher(normalized).replaceAll("-");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        return slug.replaceAll("-+", "-").replaceAll("^-|-$", "");
    }
}
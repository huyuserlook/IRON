package com.example.IRON.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, String field, Object value) {
        super("Không tìm thấy " + resource + " với " + field + " = '" + value + "'");
    }
}
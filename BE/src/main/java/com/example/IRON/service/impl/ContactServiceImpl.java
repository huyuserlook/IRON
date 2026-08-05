package com.example.IRON.service.impl;

import com.example.IRON.dto.request.ContactRequest;
import com.example.IRON.dto.request.ContactStatusRequest;
import com.example.IRON.dto.response.ContactResponse;
import com.example.IRON.entity.Contact;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.ContactRepository;
import com.example.IRON.service.interfaces.ContactService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;

    public ContactServiceImpl(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @Override
    @Transactional
    public ContactResponse create(ContactRequest request) {
Contact contact = new Contact();
        contact.setName(request.getName());
        contact.setFullName(request.getName());
        contact.setPhone(request.getPhone());
        contact.setEmail(request.getEmail());
        contact.setSubject(request.getSubject());
        contact.setMessage(request.getMessage() == null ? "" : request.getMessage());
        contact.setStatus(Contact.ContactStatus.NEW);
        return toResponse(contactRepository.save(contact));
    }

    @Override
    public Page<ContactResponse> search(String keyword, String status, Pageable pageable) {
        Contact.ContactStatus contactStatus = null;
        if (status != null && !status.isBlank()) {
            contactStatus = Contact.ContactStatus.valueOf(status);
        }
        return contactRepository.searchContacts(keyword, contactStatus, pageable)
                .map(this::toResponse);
    }

    @Override
    public ContactResponse getById(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));
        return toResponse(contact);
    }

    @Override
    @Transactional
    public ContactResponse updateStatus(Long id, ContactStatusRequest request) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));
        contact.setStatus(request.getStatus());
        return toResponse(contactRepository.save(contact));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));
        contactRepository.delete(contact);
    }

    @Override
    public long countNew() {
        return contactRepository.countByStatus(Contact.ContactStatus.NEW);
    }

    private ContactResponse toResponse(Contact contact) {
        return ContactResponse.builder()
.id(contact.getId())
                .name(contact.getName())
                .phone(contact.getPhone())
                .email(contact.getEmail())
                .subject(contact.getSubject())
                .message(contact.getMessage())
                .status(contact.getStatus())
                .createdAt(contact.getCreatedAt())
                .updatedAt(contact.getUpdatedAt())
                .build();
    }
}

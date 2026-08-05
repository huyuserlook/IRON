package com.example.IRON.repository;

import com.example.IRON.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    @Query("""
        SELECT c FROM Contact c
        WHERE (:status IS NULL OR c.status = :status)
          AND (:keyword IS NULL OR (
                LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
            ))
    """)
    Page<Contact> searchContacts(
            @Param("keyword") String keyword,
            @Param("status") Contact.ContactStatus status,
            Pageable pageable
    );

    long countByStatus(Contact.ContactStatus status);

    @Query("SELECT COUNT(c) FROM Contact c WHERE c.createdAt >= :since")
    long countNewContacts(@Param("since") LocalDateTime since);

    @Query("SELECT c FROM Contact c WHERE c.createdAt >= :since ORDER BY c.createdAt DESC")
    List<Contact> findNewContacts(@Param("since") LocalDateTime since, Pageable pageable);
}

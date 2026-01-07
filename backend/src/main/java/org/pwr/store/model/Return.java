package org.pwr.store.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "returns")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Return {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "return_id")
    private Integer returnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

    @Column(name = "return_date", nullable = false)
    private LocalDateTime returnDate;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "ROZPATRYWANY";

    @PrePersist
    protected void onCreate() {
        if (returnDate == null) {
            returnDate = LocalDateTime.now();
        }
        if (status == null) {
            status = "ROZPATRYWANY";
        }
    }
}

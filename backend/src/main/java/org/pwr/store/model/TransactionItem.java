package org.pwr.store.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "transactionitems")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tx_item_id")
    private Integer txItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id")
    private ProductItem item;

    @Column(name = "price_sold", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceSold;
}

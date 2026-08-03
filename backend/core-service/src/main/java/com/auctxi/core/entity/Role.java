package com.auctxi.core.entity;

/**
 * Defines the core access levels in the application.
 *
 * ROLE_ADMIN: System administrators who manage global settings and templates.
 * ROLE_MANAGER: League organizers who create and run their own private auctions.
 * ROLE_CLIENT: Team owners who participate in auctions and place bids.
 */
public enum Role {
    ROLE_ADMIN,
    ROLE_MANAGER,
    ROLE_CLIENT
}

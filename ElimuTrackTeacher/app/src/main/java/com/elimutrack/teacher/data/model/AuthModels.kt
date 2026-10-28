package com.elimutrack.teacher.data.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    val username: String,
    val password: String
)

data class User(
    val name: String? = null,
    val email: String? = null,
    val sub: String? = null
)

data class Tenant(
    val id: String,
    val name: String,
    val plan: String
)

data class Staff(
    @SerializedName("must_change_login")
    val mustChangeLogin: Boolean = false
)

data class SessionResponse(
    val authenticated: Boolean = false,
    val user: User? = null,
    val tenant: Tenant? = null,
    val role: String = "guest",
    val services: List<String> = emptyList(),
    val streams: List<String>? = null,
    val staff: Staff? = null
)

package com.elimutrack.teacher.data.api

import com.elimutrack.teacher.data.model.LoginRequest
import com.elimutrack.teacher.data.model.SessionResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<SessionResponse>
    
    @POST("api/auth/logout")
    suspend fun logout(): Response<Map<String, Boolean>>
    
    @GET("api/session")
    suspend fun getSession(): Response<SessionResponse>
}

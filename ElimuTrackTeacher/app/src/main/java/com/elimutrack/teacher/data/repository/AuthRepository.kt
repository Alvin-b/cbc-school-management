package com.elimutrack.teacher.data.repository

import com.elimutrack.teacher.data.api.ApiService
import com.elimutrack.teacher.data.model.LoginRequest
import com.elimutrack.teacher.data.model.SessionResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ApiService
) {
    private val _sessionState = MutableStateFlow<SessionResponse?>(null)
    val sessionState: StateFlow<SessionResponse?> = _sessionState.asStateFlow()
    
    suspend fun login(username: String, password: String): Result<SessionResponse> {
        return try {
            val response = apiService.login(LoginRequest(username, password))
            if (response.isSuccessful && response.body() != null) {
                val session = response.body()!!
                _sessionState.value = session
                Result.success(session)
            } else {
                Result.failure(Exception("Login failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun logout(): Result<Boolean> {
        return try {
            val response = apiService.logout()
            if (response.isSuccessful) {
                _sessionState.value = null
                Result.success(true)
            } else {
                Result.failure(Exception("Logout failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun checkSession(): Result<SessionResponse> {
        return try {
            val response = apiService.getSession()
            if (response.isSuccessful && response.body() != null) {
                val session = response.body()!!
                _sessionState.value = session
                Result.success(session)
            } else {
                _sessionState.value = null
                Result.failure(Exception("No session"))
            }
        } catch (e: Exception) {
            _sessionState.value = null
            Result.failure(e)
        }
    }
}

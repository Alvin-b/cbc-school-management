package com.elimutrack.teacher.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.elimutrack.teacher.data.model.SessionResponse
import com.elimutrack.teacher.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()
    
    val sessionState = authRepository.sessionState
    
    init {
        checkSession()
    }
    
    private fun checkSession() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            authRepository.checkSession()
                .onSuccess { session ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isAuthenticated = session.authenticated && session.role == "teacher"
                    )
                }
                .onFailure {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isAuthenticated = false
                    )
                }
        }
    }
    
    fun login(username: String, password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            authRepository.login(username, password)
                .onSuccess { session ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isAuthenticated = session.authenticated && session.role == "teacher",
                        error = if (!(session.authenticated && session.role == "teacher")) "Invalid teacher account" else null
                    )
                }
                .onFailure { e ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "Login failed. Please check your credentials."
                    )
                }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.value = AuthUiState()
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}

data class AuthUiState(
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val error: String? = null
)

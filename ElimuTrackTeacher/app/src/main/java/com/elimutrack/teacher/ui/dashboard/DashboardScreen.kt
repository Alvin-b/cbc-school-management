package com.elimutrack.teacher.ui.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.EventAvailable
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Grade
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.LibraryBooks
import androidx.compose.material.icons.filled.Payment
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.elimutrack.teacher.ui.theme.Indigo600
import com.elimutrack.teacher.ui.theme.Slate900
import com.elimutrack.teacher.ui.theme.Slate950
import com.elimutrack.teacher.ui.theme.Violet600
import com.elimutrack.teacher.viewmodel.AuthViewModel

data class ModuleItem(
    val name: String,
    val icon: ImageVector,
    val color: Color
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onLogout: () -> Unit,
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val sessionState by authViewModel.sessionState.collectAsState()
    
    val modules = listOf(
        ModuleItem("Dashboard", Icons.Default.Dashboard, Indigo600),
        ModuleItem("Marksbook", Icons.Default.Grade, Violet600),
        ModuleItem("Lesson Plans", Icons.Default.Book, Color(0xFF10B981)),
        ModuleItem("Schemes", Icons.Default.CalendarToday, Color(0xFFF59E0B)),
        ModuleItem("Timetable", Icons.Default.Schedule, Color(0xFF06B6D4)),
        ModuleItem("Record of Work", Icons.Default.Assignment, Color(0xFF8B5CF6)),
        ModuleItem("Progress", Icons.Default.TrendingUp, Color(0xFFEC4899)),
        ModuleItem("KICD Designs", Icons.Default.LibraryBooks, Color(0xFF14B8A6)),
        ModuleItem("Observations", Icons.Default.Person, Color(0xFF6366F1)),
        ModuleItem("Attendance", Icons.Default.EventAvailable, Color(0xFFEF4444)),
        ModuleItem("Broadsheet", Icons.Default.School, Color(0xFF22C55E)),
        ModuleItem("Learners", Icons.Default.Group, Color(0xFFF97316)),
        ModuleItem("Report Cards", Icons.Default.Assignment, Color(0xFFA855F7)),
        ModuleItem("Fees", Icons.Default.Payment, Color(0xFF84CC16)),
    )
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "ElimuTrack Teacher",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                        sessionState?.tenant?.let { tenant ->
                            Text(
                                text = tenant.name,
                                fontSize = 12.sp,
                                color = Color.Gray
                            )
                        }
                    }
                },
                actions = {
                    IconButton(onClick = onLogout) {
                        Icon(
                            imageVector = Icons.Default.ExitToApp,
                            contentDescription = "Logout",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Slate900,
                    titleContentColor = Color.White
                )
            )
        },
        containerColor = Slate950
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Slate900
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .background(
                                    brush = Brush.linearGradient(
                                        colors = listOf(Indigo600, Violet600)
                                    ),
                                    shape = RoundedCornerShape(12.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = "Teacher",
                                tint = Color.White,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                        Column(
                            modifier = Modifier
                                .padding(start = 12.dp)
                                .weight(1f)
                        ) {
                            Text(
                                text = sessionState?.user?.name ?: sessionState?.user?.email ?: "Teacher",
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White,
                                fontSize = 16.sp
                            )
                            Text(
                                text = "Role: Teacher",
                                color = Color.Gray,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            }
            
            item {
                Text(
                    text = "My Modules",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
            
            item {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.height((modules.size / 2 + modules.size % 2) * 110.dp),
                    userScrollEnabled = false
                ) {
                    items(modules) { module ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = Slate900
                            )
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(48.dp)
                                        .background(
                                            color = module.color.copy(alpha = 0.1f),
                                            shape = RoundedCornerShape(12.dp)
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = module.icon,
                                        contentDescription = module.name,
                                        tint = module.color,
                                        modifier = Modifier.size(24.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = module.name,
                                    color = Color.White,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    maxLines = 2
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

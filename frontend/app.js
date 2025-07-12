// Configuration - Update this with your actual API Gateway URL after deployment
const API_BASE_URL = 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod';

// DOM elements
const addTodoForm = document.getElementById('addTodoForm');
const todoTitle = document.getElementById('todoTitle');
const todoDescription = document.getElementById('todoDescription');
const todoItems = document.getElementById('todoItems');
const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');
const editModal = document.getElementById('editModal');
const editTodoForm = document.getElementById('editTodoForm');
const editTodoId = document.getElementById('editTodoId');
const editTodoTitle = document.getElementById('editTodoTitle');
const editTodoDescription = document.getElementById('editTodoDescription');
const editTodoCompleted = document.getElementById('editTodoCompleted');
const closeModal = document.querySelector('.close');
const cancelEdit = document.getElementById('cancelEdit');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    addTodoForm.addEventListener('submit', handleAddTodo);
    editTodoForm.addEventListener('submit', handleEditTodo);
    closeModal.addEventListener('click', hideEditModal);
    cancelEdit.addEventListener('click', hideEditModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            hideEditModal();
        }
    });
}

// Load all todos from the API
async function loadTodos() {
    try {
        showLoading();
        hideError();
        
        const response = await fetch(`${API_BASE_URL}/todos`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayTodos(data.todos);
        
    } catch (error) {
        console.error('Error loading todos:', error);
        showError('Failed to load todos. Please check if the API is deployed and the URL is correct.');
    } finally {
        hideLoading();
    }
}

// Display todos in the UI
function displayTodos(todos) {
    if (!todos || todos.length === 0) {
        todoItems.innerHTML = `
            <div class="empty-state">
                <h3>No todos yet!</h3>
                <p>Create your first todo item above.</p>
            </div>
        `;
        return;
    }
    
    const todosHtml = todos.map(todo => {
        const createdAt = new Date(todo.created_at).toLocaleDateString();
        const completedClass = todo.completed ? 'completed' : '';
        const statusBadge = todo.completed ? 
            '<span class="status-badge status-completed">Completed</span>' :
            '<span class="status-badge status-pending">Pending</span>';
        
        return `
            <div class="todo-item ${completedClass}">
                <div class="todo-header">
                    <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
                    <div class="todo-actions">
                        ${!todo.completed ? `<button class="btn btn-complete" onclick="toggleTodoComplete('${todo.id}', true)">Complete</button>` : ''}
                        <button class="btn btn-edit" onclick="openEditModal('${todo.id}')">Edit</button>
                        <button class="btn btn-delete" onclick="deleteTodo('${todo.id}')">Delete</button>
                    </div>
                </div>
                ${todo.description ? `<p class="todo-description">${escapeHtml(todo.description)}</p>` : ''}
                <div class="todo-meta">
                    Created: ${createdAt}
                    ${statusBadge}
                </div>
            </div>
        `;
    }).join('');
    
    todoItems.innerHTML = todosHtml;
}

// Handle adding a new todo
async function handleAddTodo(e) {
    e.preventDefault();
    
    const title = todoTitle.value.trim();
    const description = todoDescription.value.trim();
    
    if (!title) {
        showError('Please enter a todo title');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Clear form
        todoTitle.value = '';
        todoDescription.value = '';
        
        // Reload todos
        await loadTodos();
        
    } catch (error) {
        console.error('Error adding todo:', error);
        showError('Failed to add todo. Please try again.');
    }
}

// Open edit modal
async function openEditModal(todoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${todoId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const todo = await response.json();
        
        // Populate form
        editTodoId.value = todo.id;
        editTodoTitle.value = todo.title;
        editTodoDescription.value = todo.description || '';
        editTodoCompleted.checked = todo.completed;
        
        // Show modal
        editModal.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading todo for edit:', error);
        showError('Failed to load todo for editing.');
    }
}

// Handle editing a todo
async function handleEditTodo(e) {
    e.preventDefault();
    
    const id = editTodoId.value;
    const title = editTodoTitle.value.trim();
    const description = editTodoDescription.value.trim();
    const completed = editTodoCompleted.checked;
    
    if (!title) {
        showError('Please enter a todo title');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description,
                completed
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Hide modal
        hideEditModal();
        
        // Reload todos
        await loadTodos();
        
    } catch (error) {
        console.error('Error updating todo:', error);
        showError('Failed to update todo. Please try again.');
    }
}

// Toggle todo completion status
async function toggleTodoComplete(todoId, completed) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                completed
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Reload todos
        await loadTodos();
        
    } catch (error) {
        console.error('Error updating todo:', error);
        showError('Failed to update todo status. Please try again.');
    }
}

// Delete a todo
async function deleteTodo(todoId) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Reload todos
        await loadTodos();
        
    } catch (error) {
        console.error('Error deleting todo:', error);
        showError('Failed to delete todo. Please try again.');
    }
}

// Hide edit modal
function hideEditModal() {
    editModal.classList.add('hidden');
}

// Show loading message
function showLoading() {
    loadingMessage.classList.remove('hidden');
}

// Hide loading message
function hideLoading() {
    loadingMessage.classList.add('hidden');
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
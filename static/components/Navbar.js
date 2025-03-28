export default {
    name: "Navbar",
    template: `
      <div class="border p-2 d-flex justify-content-between align-items-center" style="background-color: #e7f1ff;">
        <!-- Left Section: Navigation Links -->
        <div class="d-flex align-items-center">
          <!-- Example brand/title -->
          <router-link class="text-decoration-none fs-4 fw-bold me-4" style="color: #2c3e50;" to="/">
            Quiz Master
          </router-link>
  
          <!-- Nav Links -->
          <router-link class="text-decoration-none me-3" style="color: green;" to="/">Home</router-link>
          <router-link class="text-decoration-none me-3" style="color: green;" to="/quiz">Quiz</router-link>
          <router-link class="text-decoration-none me-3" style="color: green;" to="/summary">Summary</router-link>
          <router-link class="text-decoration-none me-3" style="color: green;" to="/logout">Logout</router-link>
        </div>
  
        <!-- Right Section: Search & Welcome Message -->
        <div class="d-flex align-items-center">
          <!-- Search Box -->
          <input class="form-control me-3" type="search" placeholder="Search" style="width: 150px;" />
  
          <!-- Welcome Label -->
          <span class="fw-bold text-primary me-2">Welcome Admin</span>
        </div>
      </div>
    `
  }
  
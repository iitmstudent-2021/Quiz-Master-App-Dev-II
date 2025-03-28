export default {
  name: "NavbarAdmin",
  template: `
    <div class="border p-2 d-flex justify-content-between align-items-center" style="background-color: #e7f1ff;">
      <div class="d-flex align-items-center">
        <router-link class="nav-link text-decoration-none fs-4 fw-bold me-4" style="color: #2c3e50;" to="/">Quiz Master</router-link>
        <router-link class="nav-link text-decoration-none me-3" style="color: green;" to="/admin">Dashboard</router-link>
        <router-link class="nav-link text-decoration-none me-3" style="color: green;" to="/quiz">Quiz</router-link>
        <router-link class="nav-link text-decoration-none me-3" style="color: green;" to="/summary-admin">Summary</router-link>

        <!-- Search Bar -->
        <input type="text" class="form-control me-2" v-model="searchQuery" placeholder="Search users, subjects, quizzes" @keyup.enter="performSearch">
        <button class="btn btn-primary me-3" @click="performSearch">Search</button>

        <a class="text-decoration-none me-3" style="color: red; cursor: pointer;" @click="logout">Logout</a>
      </div>
      <span class="fw-bold text-primary me-2">Welcome Admin</span>
    </div>
  `,
  data() {
    return {
      searchQuery: ""
    };
  },
  methods: {
    performSearch() {
      if (!this.searchQuery.trim()) return;
      this.$router.push({ path: "/search", query: { q: this.searchQuery } });
    },
    logout() {
      localStorage.removeItem("role");
      localStorage.removeItem("auth-token");
      window.location.href = "/login";
    }
  }
};

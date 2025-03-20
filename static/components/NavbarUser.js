export default {
  name: "NavbarUser",
  template: `
    <div class="border p-2 d-flex justify-content-between align-items-center" style="background-color: #e7f1ff;">
      <div class="d-flex align-items-center">
        <router-link class="text-decoration-none fs-4 fw-bold me-4" style="color: #2c3e50;" to="/">Quiz Master</router-link>
        <router-link class="text-decoration-none me-3" style="color: green;" to="/user-dashboard">Home</router-link>
        <router-link class="text-decoration-none me-3" style="color: green;" to="/scores">Scores</router-link>
        <router-link class="text-decoration-none me-3" style="color: green;" to="/summary-user">Summary</router-link>
        
        <!-- Search Bar -->
        <!--
        <div class="d-flex me-3">
          <input v-model="searchQuery" type="text" class="form-control form-control-sm me-2" placeholder="Search...">
          <button class="btn btn-sm btn-primary" @click="performSearch">Search</button>
        </div>
        -->

        <a class="text-decoration-none me-3" style="color: red; cursor: pointer;" @click="logout">Logout</a>
      </div>
      <span class="fw-bold text-primary me-2">Welcome User</span>
    </div>
  `,
  data() {
    return {
      searchQuery: ""
    };
  },
  methods: {
    logout() {
      localStorage.removeItem("role");
      localStorage.removeItem("auth-token");
      window.location.href = "/login";
    },
    performSearch() {
      if (this.searchQuery.trim()) {
        this.$router.push({ path: "/search", query: { query: this.searchQuery } });
      }
    }
  }
}

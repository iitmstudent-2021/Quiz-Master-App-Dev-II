// Login.js
export default {
  template: `
    <div class="row border">
      <div class="col" style="height: 750px;">
        <div class="border mx-auto mt-5" style="height: 400px; width: 300px;">
          <div>
            <h2 class="text-center">Login Page</h2>
            <p class="mx-2 mt-2 text-danger">{{ message }}</p>

            <!-- Email -->
            <div class="mx-2 mb-3">
              <label for="email" class="form-label">Email address</label>
              <input 
                type="email" 
                class="form-control" 
                id="email" 
                v-model="formData.email" 
                placeholder="name@example.com"
              />
            </div>

            <!-- Password -->
            <div class="mx-2 mb-3">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                class="form-control" 
                id="password" 
                v-model="formData.password"
              />
            </div>

            <!-- Buttons / Links -->
            <div class="mx-2 mb-3 text-center">
              <button 
                class="btn btn-primary me-3" 
                @click="loginUser"
              >
                Login
              </button>
              <!-- Registration link -->
              <router-link 
                to="/register" 
                class="btn btn-link p-0" 
              >
                Register
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      formData: {
        email: "",
        password: ""
      },
      message: ""
    };
  },

  methods: {
    loginUser() {
      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(this.formData)
      })
      .then(response => response.json())
      .then(data => {
        if (data["auth-token"]) {
          // localStorage.setItem("auth_token", data["auth-token"]);
          // localStorage.setItem("id", data.id);
          // localStorage.setItem("username", data.username);
        //   // IMPORTANT: store single 'role'
          localStorage.setItem("role", data.role);
          localStorage.setItem("auth_token", data["auth-token"]);
          localStorage.setItem("role", data.role);  // "admin" or "user"

          // If the user is admin => /admin
          if (data.role === "admin") {
            this.$router.push("/admin");
          } else {
            // Otherwise => user => /user-dashboard
            this.$router.push("/user-dashboard");
          }
        } else {
          // Show any error message from backend
          this.message = data.message || "Login failed.";
        }
      })
      .catch(err => {
        console.error("Login error:", err);
        this.message = "Error logging in. Please try again.";
      });
    }
  }
};

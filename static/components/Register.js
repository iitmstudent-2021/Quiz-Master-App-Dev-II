export default {
    name: "Register",
    template: `
      <div class="row justify-content-center mt-5">
        <div class="col-md-6 col-sm-12">
          <!-- Registration Card -->
          <div class="card shadow">
            <div class="card-body">
              <h3 class="card-title text-center mb-4">Welcome to Quiz Master</h3>
              <h5 class="card-subtitle text-center mb-4 text-info">
                Registration
              </h5>
              
              <!-- Form Fields -->
              <div class="mb-3">
                <label class="form-label fw-bold">User name (E-mail):</label>
                <input 
                  type="email" 
                  class="form-control" 
                  placeholder="Enter your email" 
                  v-model="formData.email" 
                />
              </div>
              
              <div class="mb-3">
                <label class="form-label fw-bold">Password:</label>
                <input 
                  type="password" 
                  class="form-control" 
                  placeholder="Enter password" 
                  v-model="formData.password" 
                />
              </div>
              
              <div class="mb-3">
                <label class="form-label fw-bold">Full name:</label>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="e.g. John Doe" 
                  v-model="formData.full_name" 
                />
              </div>
              
              <div class="mb-3">
                <label class="form-label fw-bold">Qualification:</label>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="e.g. B.Sc in Physics" 
                  v-model="formData.qualification" 
                />
              </div>
              
              <div class="mb-3">
                <label class="form-label fw-bold">Date of Birth:</label>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="YYYY-MM-DD" 
                  v-model="formData.date_of_birth" 
                />
              </div>
              
              <!-- Submission & Existing User Link -->
              <div class="d-flex justify-content-between align-items-center mt-4">
                <button 
                  class="btn btn-primary" 
                  @click="submitRegistration"
                >
                  Submit
                </button>
                <router-link to="/login" class="text-decoration-underline">
                  Existing user?
                </router-link>
              </div>
              
              <!-- Optional error or success message display -->
              <p class="text-danger mt-3" v-if="message">
                {{ message }}
              </p>
              
            </div>
          </div>
        </div>
      </div>
    `,
  
    data() {
      return {
        formData: {
          email: "",
          password: "",
          full_name: "",
          qualification: "",
          date_of_birth: ""
        },
        message: "" // for any error/success feedback
      }
    },
  
    methods: {
      async submitRegistration() {
        // Basic validation
        if (
          !this.formData.email ||
          !this.formData.password ||
          !this.formData.full_name ||
          !this.formData.qualification ||
          !this.formData.date_of_birth
        ) {
          this.message = "Please fill in all required fields.";
          return;
        }
  
        // For your API, we must supply BOTH 'email' AND 'username'. 
        // If you want them identical, just set username = email:
        const payload = {
          email: this.formData.email,
          username: this.formData.email, // reusing the email
          password: this.formData.password,
          full_name: this.formData.full_name,
          qualification: this.formData.qualification,
          date_of_birth: this.formData.date_of_birth
        };
  
        try {
          const res = await fetch("/api/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });
  
          const data = await res.json();
          if (!res.ok) {
            // e.g. 400 or 409, show error
            this.message = data.message || "Registration failed!";
          } else {
            console.log("User created:", data);
            alert("Registration successful!");
            // Optionally redirect to login
            this.$router.push("/login");
          }
        } catch (err) {
          console.error("Registration error:", err);
          this.message = "Error registering user. Please try again.";
        }
      }
    }
  };
  
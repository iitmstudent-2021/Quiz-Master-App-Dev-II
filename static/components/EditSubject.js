export default {
    name: "EditSubject",
    template: `
      <div class="p-4" style="background-color: #f9fcff; min-height: 100vh;">
        <h2 class="mb-4 text-center">Edit Subject</h2>
  
        <div v-if="subject" class="card mx-auto p-4 shadow" style="max-width: 500px;">
          <!-- Edit Subject Name -->
          <div class="mb-3">
            <label class="form-label fw-bold">Subject Name:</label>
            <input v-model="subject.name" type="text" class="form-control" />
          </div>
  
          <!-- Edit Subject Description -->
          <div class="mb-3">
            <label class="form-label fw-bold">Description:</label>
            <textarea v-model="subject.description" class="form-control"></textarea>
          </div>
  
          <!-- Buttons: Save, Delete, Cancel -->
          <div class="d-flex justify-content-between">
            <button class="btn btn-primary" @click="updateSubject">Save Changes</button>
            <button class="btn btn-danger" @click="deleteSubject">Delete</button>
            <button class="btn btn-secondary" @click="$router.push('/admin')">Cancel</button>
          </div>
        </div>
  
        <!-- Loading message -->
        <div v-else class="text-center mt-4">
          <p class="text-muted">Loading subject details...</p>
        </div>
      </div>
    `,
  
    data() {
      return {
        subject: null,
      };
    },
  
    mounted() {
      this.fetchSubjectDetails();
    },
  
    methods: {
      // Fetch subject details from API
      fetchSubjectDetails() {
        const subjectId = this.$route.params.id;  // Get subject ID from the URL
  
        fetch(`/api/subjects/${subjectId}`, {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          }
        })
          .then((res) => res.json())
          .then((data) => {
            this.subject = data;
          })
          .catch((err) => {
            console.error("Error fetching subject details:", err);
          });
      },
  
      // Update subject details
      updateSubject() {
        if (!this.subject.name.trim()) {
          alert("Subject name cannot be empty!");
          return;
        }
  
        fetch(`/api/subjects/${this.subject.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          },
          body: JSON.stringify({
            name: this.subject.name,
            description: this.subject.description
          })
        })
          .then((res) => res.json())
          .then(() => {
            alert("Subject updated successfully!");
            this.$router.push("/admin"); // Redirect to dashboard
          })
          .catch((err) => {
            console.error("Error updating subject:", err);
          });
      },
  
      // Delete subject
      deleteSubject() {
        if (!confirm("Are you sure you want to delete this subject? This action cannot be undone.")) {
          return;
        }
  
        fetch(`/api/subjects/${this.subject.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          }
        })
          .then((res) => res.json())
          .then(() => {
            alert("Subject deleted successfully!");
            this.$router.push("/admin"); // Redirect to dashboard after deletion
          })
          .catch((err) => {
            console.error("Error deleting subject:", err);
          });
      }
    }
  };
  
export default {
    name: "AddChapter",
    template: `
      <div class="p-3" style="max-width: 500px; margin: auto;">
        <!-- Dynamic Heading: "New Chapter" or "Edit Chapter" -->
        <h2 class="text-center text-warning" style="margin-bottom: 1rem; font-weight: bold;">
          <span v-if="isEditMode">Edit Chapter</span>
          <span v-else>New Chapter</span>
        </h2>
  
        <div class="card" style="border: 2px solid #ffa500; border-radius: 8px;">
          <div class="card-body" style="background-color: #ffffff;">
            <!-- Chapter Name -->
            <div class="mb-3">
              <label class="form-label fw-bold">Name:</label>
              <input
                type="text"
                class="form-control"
                v-model="chapterData.name"
                placeholder="e.g. Force"
              />
            </div>
  
            <!-- Description -->
            <div class="mb-3">
              <label class="form-label fw-bold">Description:</label>
              <textarea
                class="form-control"
                rows="3"
                v-model="chapterData.description"
                placeholder="Short summary of the chapter"
              ></textarea>
            </div>
  
            <!-- Number of Questions -->
            <div class="mb-3">
              <label class="form-label fw-bold">No. of Questions:</label>
              <input
                type="number"
                class="form-control"
                v-model="chapterData.no_of_questions"
              />
            </div>
  
            <p class="text-danger">
              Note: you may include more input fields as needed...
            </p>
  
            <!-- Buttons: Create/Edit, Delete (only if edit), Cancel -->
            <div class="text-end mt-4">
              <!-- If new chapter, show "Create"; if editing, show "Update" -->
              <button
                v-if="!isEditMode"
                class="btn btn-primary me-2"
                @click="createChapter"
              >
                Create
              </button>
              <button
                v-else
                class="btn btn-primary me-2"
                @click="updateChapter"
              >
                Update
              </button>
  
              <!-- Delete button only in edit mode -->
              <button
                v-if="isEditMode"
                class="btn btn-danger me-2"
                @click="deleteChapter"
              >
                Delete
              </button>
  
              <button class="btn btn-secondary" @click="cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  
    data() {
      return {
        isEditMode: false,
        subjectId: null,
        chapterId: null,
        chapterData: {
          name: "",
          description: "",
          no_of_questions: 0
        }
      }
    },
  
    mounted() {
      // We expect route params: { subjectId, chapterId? }
      this.subjectId = this.$route.params.subjectId
      this.chapterId = this.$route.params.chapterId || null
  
      // If we have a chapterId, we're in "edit" mode. Fetch existing chapter data.
      if (this.chapterId) {
        this.isEditMode = true
        fetch(`/api/chapters/${this.chapterId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          }
        })
          .then((res) => res.json())
          .then((data) => {
            // Populate form fields with existing data
            this.chapterData.name = data.name
            this.chapterData.description = data.description
            this.chapterData.no_of_questions = data.no_of_questions
            // subjectId is read from the chapter, in case the route param differs
            this.subjectId = data.subject_id
          })
          .catch((err) => console.error("Error fetching chapter:", err))
      } else {
        // Otherwise, "add" mode
        this.isEditMode = false
        // Optionally default no_of_questions to 1 if you prefer
        this.chapterData.no_of_questions = 1
      }
    },
  
    methods: {
      // Create a new chapter
      createChapter() {
        // Validate required fields
        if (!this.chapterData.name.trim()) {
          alert("Chapter name is required.")
          return
        }
        if (!this.chapterData.no_of_questions || this.chapterData.no_of_questions < 1) {
          alert("No. of questions must be at least 1.")
          return
        }
  
        // POST /api/chapters
        fetch("/api/chapters", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          },
          body: JSON.stringify({
            name: this.chapterData.name,
            description: this.chapterData.description,
            no_of_questions: this.chapterData.no_of_questions,
            subject_id: this.subjectId
          })
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Chapter created:", data)
            // Go back to admin page
            this.$router.push("/admin")
          })
          .catch((err) => console.error("Error creating chapter:", err))
      },
  
      // Update existing chapter
      updateChapter() {
        if (!this.chapterId) return
  
        // Validate
        if (!this.chapterData.name.trim()) {
          alert("Chapter name is required.")
          return
        }
        if (!this.chapterData.no_of_questions || this.chapterData.no_of_questions < 1) {
          alert("No. of questions must be at least 1.")
          return
        }
  
        // PUT /api/chapters/:chapterId
        fetch(`/api/chapters/${this.chapterId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          },
          body: JSON.stringify({
            name: this.chapterData.name,
            description: this.chapterData.description,
            no_of_questions: this.chapterData.no_of_questions,
            subject_id: this.subjectId
          })
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Chapter updated:", data)
            this.$router.push("/admin")
          })
          .catch((err) => console.error("Error updating chapter:", err))
      },
  
      // Delete existing chapter
      deleteChapter() {
        if (!this.chapterId) return
        if (!confirm("Are you sure you want to delete this chapter?")) return
  
        // DELETE /api/chapters/:chapterId
        fetch(`/api/chapters/${this.chapterId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          }
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Chapter deleted:", data)
            this.$router.push("/admin")
          })
          .catch((err) => console.error("Error deleting chapter:", err))
      },
  
      // Cancel and return to admin
      cancel() {
        this.$router.push("/admin")
      }
    }
  }
  
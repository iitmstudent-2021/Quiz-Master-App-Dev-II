export default {
  template: `
    <div class="p-4" style="background-color: #f9fcff; min-height: 100vh;">
      <!-- Dashboard Heading -->
      <h2 class="mb-4 text-center">Admin Dashboard</h2>

      <!-- Subject Cards Row -->
      <div class="d-flex flex-wrap justify-content-start">
        <!-- Loop through each subject -->
        <div
          v-for="subject in subjects"
          :key="subject.id"
          class="card me-3 mb-3 shadow-sm"
          style="width: 300px; border: 2px solid #a5a5a5;"
        >
          <!-- Subject Title -->
          <div class="card-header bg-white text-center fw-bold">
            {{ subject.name }}
          </div>

          <!-- Chapters Table -->
          <div class="card-body">
            <!-- Table heading row -->
            <div class="d-flex justify-content-between mb-2 border-bottom fw-bold">
              <span>Chapter</span>
              <span>Qns</span>
              <span>Action</span>
            </div>
            <!-- Each chapter row -->
            <div
              v-for="chap in subject.chapters"
              :key="chap.id"
              class="d-flex justify-content-between align-items-center mb-2"
            >
              <span>{{ chap.name }}</span>
              <span>{{ chap.no_of_questions }}</span>
              <span>
                <button
                  class="btn btn-link p-0 text-primary"
                  @click="editChapter(chap)"
                >
                  Edit
                </button>
                /
                <button
                  class="btn btn-link p-0 text-danger"
                  @click="deleteChapter(chap.id)"
                >
                  Del
                </button>
              </span>
            </div>
            <!-- Add chapter button -->
            <button
              class="btn btn-sm btn-secondary w-100 mt-3"
              @click="addChapter(subject.id)"
            >
              + Chapter
            </button>
          </div>
        </div>
      </div>

      <!-- If no subjects -->
      <div v-if="subjects.length === 0" class="text-muted text-center fs-5 mt-4">
        All subjects here ...
      </div>

      <!-- Floating button (or bottom button) for adding a new subject -->
      <button
        class="btn btn-primary rounded-circle"
        @click="addSubject"
        style="
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          font-size: 1.5rem;
        "
      >
        +
      </button>
    </div>
  `,
  name: "AdminDashboard",
  data() {
    return {
      subjects: []
    }
  },
  mounted() {
    this.loadSubjects()
  },
  methods: {
    // Fetch subjects from the back end (including their chapters)
    loadSubjects() {
      fetch("/api/subjects", {
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then((res) => res.json())
        .then((data) => {
          // The data should be an array of subjects,
          // each subject might have a chapters array
          this.subjects = data
        })
        .catch((err) => console.error("Error loading subjects:", err))
    },

    // Add a new subject, then redirect to /dashboard
    addSubject() {
      const name = prompt("Enter Subject name:")
      if (!name) return
      const description = prompt("Enter Subject description:")
      if (description === null) return

      fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify({ name, description })
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Subject created:", data)
          // After creating a subject, redirect to /dashboard
          // this.$router.push("/dashboard")
          this.$router.push("/admin")
        })
        .catch((err) => console.error("Error creating subject:", err))
    },

    // Add a new chapter to an existing subject
    addChapter(subjectId) {
      const chapterName = prompt("Chapter name:")
      if (!chapterName) return
      const chapterDesc = prompt("Chapter description:")
      if (chapterDesc === null) return
      const noOfQuestions = parseInt(prompt("Number of questions:"), 10)
      if (isNaN(noOfQuestions)) {
        alert("Invalid number of questions.")
        return
      }

      fetch("/api/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify({
          name: chapterName,
          description: chapterDesc,
          no_of_questions: noOfQuestions,
          subject_id: subjectId
        })
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Chapter created:", data)
          this.loadSubjects()
        })
        .catch((err) => console.error("Error adding chapter:", err))
    },

    // Edit a chapter
    editChapter(chapter) {
      const newName = prompt("New chapter name:", chapter.name)
      if (!newName) return
      const newDesc = prompt("New description:", chapter.description)
      if (newDesc === null) return
      const newNo = parseInt(
        prompt("New number of questions:", chapter.no_of_questions),
        10
      )
      if (isNaN(newNo)) {
        alert("Invalid number of questions.")
        return
      }

      fetch(`/api/chapters/${chapter.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          no_of_questions: newNo,
          subject_id: chapter.subject_id
        })
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Chapter updated:", data)
          this.loadSubjects()
        })
        .catch((err) => console.error("Error editing chapter:", err))
    },

    // Delete a chapter
    deleteChapter(chapterId) {
      if (!confirm("Are you sure you want to delete this chapter?")) return

      fetch(`/api/chapters/${chapterId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Chapter deleted:", data)
          this.loadSubjects()
        })
        .catch((err) => console.error("Error deleting chapter:", err))
    }
  }
}

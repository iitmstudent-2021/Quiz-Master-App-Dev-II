export default {
    name: "EditQuiz",
    template: `
      <div class="p-3" style="max-width: 600px; margin: auto;">
        <h2 class="text-center text-warning" style="margin-bottom: 1rem; font-weight: bold;">
          Edit Quiz
        </h2>
        <div class="card" style="border: 2px solid #ffa500; border-radius: 8px;">
          <div class="card-body" style="background-color: #ffffff;">
            <!-- Quiz Name -->
            <div class="mb-3">
              <label class="form-label fw-bold">Quiz Name:</label>
              <input type="text" class="form-control" v-model="quizData.name" />
            </div>
            <!-- Chapter Selection -->
            <div class="mb-3">
              <label class="form-label fw-bold">Chapter:</label>
              <select class="form-select" v-model="quizData.chapter_id">
                <option value="">Select Chapter</option>
                <option v-for="chap in chapters" :key="chap.id" :value="chap.id">
                  {{ chap.name }}
                </option>
              </select>
            </div>
            <!-- Quiz Date -->
            <div class="mb-3">
              <label class="form-label fw-bold">Quiz Date (YYYY-MM-DD HH:MM:SS):</label>
              <input type="text" class="form-control" v-model="quizData.quiz_date" />
            </div>
            <!-- Duration in minutes -->
            <div class="mb-3">
              <label class="form-label fw-bold">Duration (in minutes):</label>
              <input type="number" class="form-control" v-model="quizData.duration_time" />
            </div>
            <div class="text-end mt-4">
              <button class="btn btn-primary me-2" @click="updateQuiz">Update</button>
              <button class="btn btn-secondary" @click="cancel">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        quizData: {
          name: "",
          chapter_id: "",
          quiz_date: "",
          duration_time: 0
        },
        chapters: []
      }
    },
    mounted() {
      this.loadChapters();
      const quizId = this.$route.params.quizId;
      fetch(`/api/quizzes/${quizId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then(res => res.json())
        .then(data => {
          // Convert the ISO date (e.g., "2025-04-15T10:00:00" or "2025-04-15T10:00:00.000Z")
          // to the expected format "YYYY-MM-DD HH:MM:SS"
          let formattedDate = data.quiz_date;
          if (formattedDate && formattedDate.includes("T")) {
            formattedDate = formattedDate.split('.')[0].replace("T", " ");
          }
          this.quizData = {
            name: data.name,
            chapter_id: data.chapter_id,
            quiz_date: formattedDate,
            duration_time: parseInt(data.duration_time)
          }
        })
        .catch(err => console.error("Error fetching quiz:", err));
    },
    methods: {
      loadChapters() {
        fetch("/api/chapters", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          }
        })
          .then(res => res.json())
          .then(data => {
            this.chapters = data;
          })
          .catch(err => console.error("Error loading chapters:", err));
      },
      updateQuiz() {
        const quizId = this.$route.params.quizId;
        fetch(`/api/quizzes/${quizId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          },
          body: JSON.stringify(this.quizData)
        })
          .then(res => res.json())
          .then(data => {
            console.log("Quiz updated:", data);
            this.$router.push("/quiz");
          })
          .catch(err => console.error("Error updating quiz:", err));
      },
      cancel() {
        this.$router.push("/quiz");
      }
    }
  }
  
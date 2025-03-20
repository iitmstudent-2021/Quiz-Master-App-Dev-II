export default {
    name: "ViewQuiz",
    template: `
      <div class="p-3" style="max-width: 500px; margin: auto;">
        <h2 class="text-center text-info mb-3">View the Quiz</h2>
  
        <!-- Card for quiz details -->
        <div class="card" style="border: 2px solid #17a2b8; border-radius: 6px;">
          <div class="card-body">
  
            <!-- Quiz ID -->
            <p>
              <strong>ID:</strong>
              <span class="ms-2">{{ quiz.id }}</span>
            </p>
  
            <!-- Subject Name -->
            <p>
              <strong>Subject:</strong>
              <span class="ms-2">{{ subjectName }}</span>
            </p>
  
            <!-- Chapter Name -->
            <p>
              <strong>Chapter:</strong>
              <span class="ms-2">{{ chapterName }}</span>
            </p>
  
            <!-- Number of Questions -->
            <p>
              <strong>Number of Questions:</strong>
              <span class="ms-2">
                <!-- If quiz.questions is present, else 0 -->
                {{ quiz.questions ? quiz.questions.length : 0 }}
              </span>
            </p>
  
            <!-- Scheduled Date -->
            <p>
              <strong>Scheduled Date:</strong>
              <span class="ms-2">{{ formatDate(quiz.quiz_date) }}</span>
            </p>
  
            <!-- Duration -->
            <p>
              <strong>Duration (hh:mm):</strong>
              <span class="ms-2">{{ formatDuration(quiz.duration_time) }}</span>
            </p>
  
            <!-- Close Button -->
            <div class="text-end mt-4">
              <button class="btn btn-secondary" @click="closePage">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  
    data() {
      return {
        quiz: {},
        subjectName: "",
        chapterName: ""
      }
    },
  
    mounted() {
      const quizId = this.$route.params.quizId
      this.fetchQuiz(quizId)
    },
  
    methods: {
      // 1) Fetch the quiz details from /api/quizzes/:quizId
      // 2) Then fetch the chapter to get the chapter name
      // 3) Then fetch the subject for the subject name
      fetchQuiz(quizId) {
        fetch(`/api/quizzes/${quizId}`, {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          }
        })
          .then((res) => res.json())
          .then((quizData) => {
            this.quiz = quizData
            // Then fetch chapter
            return fetch(`/api/chapters/${quizData.chapter_id}`, {
              headers: {
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem("auth_token")
              }
            })
          })
          .then((res) => res.json())
          .then((chapterData) => {
            this.chapterName = chapterData.name
            // Then fetch subject for subject name
            return fetch(`/api/subjects/${chapterData.subject_id}`, {
              headers: {
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem("auth_token")
              }
            })
          })
          .then((res) => res.json())
          .then((subjectData) => {
            this.subjectName = subjectData.name
          })
          .catch((err) => console.error("Error fetching quiz info:", err))
      },
  
      // Go back to wherever you like (e.g. user-dashboard)
      closePage() {
        this.$router.push("/user-dashboard")
      },
  
      formatDate(dateString) {
        if (!dateString) return "N/A"
        const d = new Date(dateString)
        return d.toLocaleString() // or adapt to your preferred format
      },
  
      formatDuration(durationStr) {
        // e.g. "0:10:00" from the backend
        // You can parse or return raw
        if (!durationStr) return "N/A"
        return durationStr
      }
    }
  }
  
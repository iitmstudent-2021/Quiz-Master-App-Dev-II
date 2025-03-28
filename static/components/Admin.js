export default {
  template: `
    <div class="p-4" style="background-color: #f9fcff; min-height: 100vh;">
      <!-- Dashboard Heading -->
      <h2 class="mb-4 text-center">Admin Dashboard</h2>

      <!-- Performance Export Button -->
      <div class="text-end mb-3">
        <button 
          class="btn btn-success" 
          @click="exportAllPerformance"
          :disabled="isExporting"
        >
          {{ isExporting ? "Processing..." : "Export All Performance" }}
        </button>
      </div>

      <!-- Subject Cards Row -->
      <div class="d-flex flex-wrap justify-content-start">
        <div
          v-for="subject in subjects"
          :key="subject.id"
          class="card me-3 mb-3 shadow-sm"
          style="width: 300px; border: 2px solid #a5a5a5;"
        >
          <div class="card-header bg-white text-center fw-bold d-flex justify-content-between align-items-center">
            <span>{{ subject.name }}</span>
            <div>
              <button class="btn btn-sm btn-outline-primary me-2" @click="editSubject(subject.id)">✎ Edit</button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteSubject(subject.id)">🗑 Delete</button>
            </div>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2 border-bottom fw-bold">
              <span>Chapter</span>
              <span>Qns</span>
              <span>Action</span>
            </div>
            <div v-for="chap in subject.chapters" :key="chap.id" class="d-flex justify-content-between align-items-center mb-2">
              <span>{{ chap.name }}</span>
              <span>{{ chap.no_of_questions }}</span>
              <span>
                <button class="btn btn-link p-0 text-primary" @click="editChapter(chap)">Edit</button>
                /
                <button class="btn btn-link p-0 text-danger" @click="deleteChapter(chap.id)">Del</button>
              </span>
            </div>
            <button class="btn btn-sm btn-secondary w-100 mt-3" @click="addChapter(subject.id)">+ Chapter</button>
          </div>
        </div>
      </div>

      <div v-if="subjects.length === 0" class="text-muted text-center fs-5 mt-4">
        All subjects here ...
      </div>

      <button
        class="btn btn-primary rounded-circle"
        @click="goToAddSubject"
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
      subjects: [],
      isExporting: false,
      taskId: null,
    };
  },
  mounted() {
    this.loadSubjects();
  },
  methods: {
    loadSubjects() {
      fetch("/api/subjects", {
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then((res) => res.json())
        .then((data) => {
          this.subjects = data;
        })
        .catch((err) => console.error("Error loading subjects:", err));
    },

    goToAddSubject() {
      this.$router.push("/add-subject");
    },

    editSubject(subjectId) {
      this.$router.push(`/edit-subject/${subjectId}`);
    },

    deleteSubject(subjectId) {
      if (!confirm("Are you sure you want to delete this subject?")) return;
      fetch(`/api/subjects/${subjectId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then((res) => res.json())
        .then(() => this.loadSubjects())
        .catch((err) => console.error("Error deleting subject:", err));
    },

    addChapter(subjectId) {
      this.$router.push({ name: "chapter-form", params: { subjectId } });
    },

    editChapter(chapter) {
      this.$router.push({ name: "chapter-form", params: { subjectId: chapter.subject_id, chapterId: chapter.id } });
    },

    deleteChapter(chapterId) {
      if (!confirm("Are you sure you want to delete this chapter?")) return;
      fetch(`/api/chapters/${chapterId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then((res) => res.json())
        .then(() => this.loadSubjects())
        .catch((err) => console.error("Error deleting chapter:", err));
    },

    exportAllPerformance() {
      this.isExporting = true;
      fetch("/api/export_all_user_performance", {
        headers: {
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.task_id) {
            this.taskId = data.task_id;
            this.checkCsvStatus();
          } else {
            alert("Error starting performance export.");
            this.isExporting = false;
          }
        })
        .catch(err => {
          console.error("Error exporting performance report:", err);
          this.isExporting = false;
        });
    },

    checkCsvStatus() {
      if (!this.taskId) return;
      const interval = setInterval(() => {
        fetch(`/api/csv_result/${this.taskId}`, {
          headers: { "Authentication-Token": localStorage.getItem("auth_token") }
        })
          .then(res => {
            if (res.status === 202) return res.json();
            if (res.status === 404) {
              clearInterval(interval);
              this.isExporting = false;
              return null;
            }
            if (res.ok) {
              clearInterval(interval);
              return res.blob();
            }
            throw new Error("Failed to fetch CSV");
          })
          .then(blob => {
            if (blob && blob instanceof Blob) {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "quiz_report.csv";
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              this.isExporting = false;
            }
          })
          .catch(err => {
            console.error("Error checking CSV status:", err);
            clearInterval(interval);
            this.isExporting = false;
          });
      }, 3000);
    }
  }
};

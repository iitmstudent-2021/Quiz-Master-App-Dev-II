console.log("Vue:", Vue);
console.log("VueRouter:", VueRouter);

// Enable VueRouter
Vue.use(VueRouter);

// Import Components
import Home from './components/Home.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import NavbarAdmin from './components/NavbarAdmin.js';
import NavbarUser from './components/NavbarUser.js';
import Footer from './components/Footer.js';
import Dashboard from './components/Dashboard.js';
import Admin from './components/Admin.js';
import AddSubject from './components/AddSubject.js';
import AddChapter from './components/AddChapter.js';
import QuizManagement from './components/QuizManagement.js';
import AddQuiz from './components/AddQuiz.js';
import EditQuiz from './components/EditQuiz.js';
import AddQuestion from './components/AddQuestion.js';
import QuestionList from './components/QuestionList.js';
import UserDashboard from './components/UserDashboard.js';
import AttemptQuiz from './components/AttemptQuiz.js';
import ViewQuiz from "./components/ViewQuiz.js";
import UserScores from './components/UserScores.js';
import SummaryUser from './components/SummaryUser.js';
import SummaryAdmin from './components/SummaryAdmin.js';
import SearchComponent from './components/SearchComponent.js';
import EditSubject from './components/EditSubject.js';

// Define application routes
const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/dashboard', component: Dashboard },
    { path: '/admin', component: Admin },
    { path: '/add-subject', component: AddSubject },
    { path: '/add-chapter/:subjectId', name: 'add-chapter', component: AddChapter },
    { path: '/chapter/:subjectId/:chapterId?', name: 'chapter-form', component: AddChapter },
    { path: '/quiz', component: QuizManagement },
    { path: '/add-quiz', component: AddQuiz },
    { path: '/edit-quiz/:quizId', name: 'edit-quiz', component: EditQuiz },
    { path: '/add-question/:quizId', name: 'add-question', component: AddQuestion },
    { path: '/edit-question/:quizId/:questionId', name: 'edit-question', component: AddQuestion },
    { path: '/questions', component: QuestionList },
    { path: "/user-dashboard", component: UserDashboard },
    { path: '/attempt-quiz/:quizId', name: 'attempt-quiz', component: AttemptQuiz },
    { path: '/view-quiz/:quizId', name: 'view-quiz', component: ViewQuiz },
    { path: '/scores', component: UserScores },
    { path: '/summary-user', name: 'summary-user', component: SummaryUser },
    { path: '/summary-admin', name: 'summary-admin', component: SummaryAdmin },
    { path: '/search', component: SearchComponent },
    { path: "/edit-subject/:id", name: "edit-subject", component: EditSubject }

];

// Initialize VueRouter
const router = new VueRouter({
    mode: 'hash',
    routes
});

// Create the main Vue instance
new Vue({
    el: "#app",
    router,
    computed: {
        showNavbar() {
            return this.currentRole !== "";
        },
        navbarComponent() {
            return this.currentRole === "admin" ? "nav-bar-admin" : "nav-bar-user";
        }
    },
    template: `
        <div class="container">
            <component v-if="showNavbar" :is="navbarComponent"></component>
            <router-view></router-view>
            <foot></foot>
        </div>
    `,
    data() {
        return {
            currentRole: localStorage.getItem("role") || ""  // Fetch role on initialization
        };
    },
    watch: {
        '$route'() {
            this.updateNavbar();
        }
    },
    methods: {
        updateNavbar() {
            this.currentRole = localStorage.getItem("role") || "";
        }
    },
    components: {
        "nav-bar-admin": NavbarAdmin,
        "nav-bar-user": NavbarUser,
        "foot": Footer
    }
});

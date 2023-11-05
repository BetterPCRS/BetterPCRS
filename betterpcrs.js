// ==UserScript==
// @name         BetterPCRS
// @description  Improved PCRS experience, including the ability to use hotkeys for switching the currently active question.
// @version      1.4
// @author       TheRedstoneRadiant
// @match        https://pcrs.utm.utoronto.ca/*/content/challenges/*/*
// @license MIT
// @namespace https://github.com/TheRedstoneRadiant
// ==/UserScript==
 
class BetterPCRS {
  constructor() {
    this.BACKWARD_HOTKEY = "["; // Change to your preferred hotkey
    this.FORWARD_HOTKEY = "]"; //  Change to your preferred hotkey
    this.challengeId = this.fetchChallengeId();
    this.localStorageKey = `activeQuestion-${this.challengeId}`;
    this.questions = document.querySelectorAll(".main-page > div");
    this.activeQuestion = this.loadActiveQuestion();
    this.setupEventListeners();
    this.focusQuestion(this.activeQuestion);
  }
 
  fetchChallengeId() {
    const urlPaths = window.location.href.split("/");
    return `${parseInt(urlPaths[urlPaths.length - 2])}-${parseInt(
      urlPaths[urlPaths.length - 1],
    )}`;
  }
 
  loadActiveQuestion() {
    const savedQuestion = localStorage.getItem(this.localStorageKey);
    return savedQuestion ? parseInt(savedQuestion, 10) : 0;
  }
 
  saveActiveQuestion() {
    localStorage.setItem(this.localStorageKey, this.activeQuestion.toString());
  }
 
  unfocusQuestion(questionIndex) {
    const previousQuestionElement = this.questions[questionIndex];
    previousQuestionElement.style.backgroundColor = "unset";
  }
 
  focusQuestion(questionIndex) {
    const questionElement = this.questions[questionIndex];
    questionElement.style.backgroundColor = "rgba(0, 0, 255, 0.1)";
    questionElement.scrollIntoView();
  }
 
  submitQuestion(questionIndex) {
    const questionElement = this.questions[questionIndex];
    const submitButton = questionElement.querySelector("#submit-id-submit");
    if (submitButton) {
      submitButton.click();
    }
  }
 
  hotkeyEvent = (e) => {
    const key = e.key || e.code;
    const keyCode = e.keyCode || e.which;
 
    const isNumericHotkey = !isNaN(parseInt(key));
    const activeQuestionElement = this.questions[this.activeQuestion];
    const isMultipleChoice =
      activeQuestionElement.id.startsWith("multiple_choice");
 
    if (isMultipleChoice && isNumericHotkey) {
      const checkboxElements =
        activeQuestionElement.querySelectorAll("[type=checkbox]");
 
      if (key <= checkboxElements.length) {
        e.preventDefault();
        const elementIndex = key - 1;
        checkboxElements[elementIndex].click();
        return;
      }
    }
 
    const submitHotkeyPressed =
      (key.toLowerCase() == "enter" || keyCode === 10) && e.ctrlKey; // Ctrl + Enter
    const forwardHotkeyPressed = key === this.FORWARD_HOTKEY && e.ctrlKey; // Ctrl + FORWARD_HOTKEY
    const backwardHotkeyPressed = key === this.BACKWARD_HOTKEY && e.ctrlKey; // Ctrl + BACKWARD_HOTKEY
 
    if (
      !forwardHotkeyPressed &&
      !backwardHotkeyPressed &&
      !submitHotkeyPressed
    ) {
      return;
    }
 
    e.preventDefault();
 
    // Submit question on Ctrl + Enter
    if (submitHotkeyPressed) {
      this.submitQuestion(this.activeQuestion);
      return;
    }
 
    // Unfocus previous question
    this.unfocusQuestion(this.activeQuestion);
 
    // Forward
    if (forwardHotkeyPressed) {
      this.activeQuestion = Math.min(
        this.questions.length - 1,
        this.activeQuestion + 1,
      );
    }
 
    // Backward
    else if (backwardHotkeyPressed) {
      this.activeQuestion = Math.max(0, this.activeQuestion - 1);
    }
 
    // Focus new question
    this.focusQuestion(this.activeQuestion);
    this.saveActiveQuestion();
  };
 
  setupEventListeners() {
    this.questions.forEach((question, index) => {
      // Assign onclick handler
      question.addEventListener("click", () => {
        if (this.activeQuestion !== index) {
          // Unfocus previous question
          this.unfocusQuestion(this.activeQuestion);
 
          // Focus clicked question
          this.activeQuestion = index;
          this.focusQuestion(this.activeQuestion);
          this.saveActiveQuestion();
        }
      });
    });
 
    // Add hotkey event listener
    window.addEventListener("keydown", this.hotkeyEvent);
  }
}
 
// Instantiate and run BetterPCRS
new BetterPCRS();


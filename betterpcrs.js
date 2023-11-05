// ==UserScript==
// @name         BetterPCRS
// @description  Improved PCRS experience, including the ability to use hotkeys for switching the currently active question.
// @version      1.4.1
// @author       TheRedstoneRadiant
// @match        https://pcrs.utm.utoronto.ca/*/content/challenges/*/*
// @license MIT
// @namespace https://github.com/TheRedstoneRadiant
// ==/UserScript==

class BetterPCRS {
  constructor() {
    this.BACKWARD_HOTKEY = "["; //   Change to your preferred hotkey
    this.FORWARD_HOTKEY = "]"; //    Change to your preferred hotkey
    this.BRUTEFORCE_HOTKEY = "b"; // Change to your preferred hotkey
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
      urlPaths[urlPaths.length - 1]
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

  toggleCheckbox = (checkboxElements, elementIndex) => {
    checkboxElements[elementIndex].click();
  };

  generateCheckboxCombinations = (numCheckboxes) => {
    const combinations = [];

    function generateCombinations(index, currentCombination) {
      if (index === numCheckboxes) {
        combinations.push(currentCombination.slice()); // Clone the array
      } else {
        // Include the current checkbox
        currentCombination.push(index);
        generateCombinations(index + 1, currentCombination);

        // Exclude the current checkbox
        currentCombination.pop();
        generateCombinations(index + 1, currentCombination);
      }
    }

    generateCombinations(0, []);

    return combinations;
  };

  hotkeyEvent = (e) => {
    const key = e.key || e.code;
    const keyCode = e.keyCode || e.which;

    const isNumericHotkey = !isNaN(parseInt(key));
    const activeQuestionElement = this.questions[this.activeQuestion];
    const isMultipleChoice =
      activeQuestionElement.id.startsWith("multiple_choice");

    const submitHotkeyPressed =
      (key.toLowerCase() == "enter" || keyCode === 10) && e.ctrlKey; // Ctrl + Enter
    const forwardHotkeyPressed = key === this.FORWARD_HOTKEY && e.ctrlKey; // Ctrl + FORWARD_HOTKEY
    const backwardHotkeyPressed = key === this.BACKWARD_HOTKEY && e.ctrlKey; // Ctrl + BACKWARD_HOTKEY
    const bruteforceHotkeyPressed = key == this.BRUTEFORCE_HOTKEY && e.ctrlKey; // Ctrl + BRUTEFORCE_HOTKEY

    if (isMultipleChoice && (isNumericHotkey || bruteforceHotkeyPressed)) {
      e.preventDefault();
      const checkboxElements =
        this.questions[this.activeQuestion].querySelectorAll("[type=checkbox]");
      if (isNumericHotkey && key <= checkboxElements.length) {
        return this.toggleCheckbox(checkboxElements, key - 1);
      } else if (bruteforceHotkeyPressed) {
        const numCheckboxes = checkboxElements.length;
        const combinations = this.generateCheckboxCombinations(numCheckboxes);
        let currentIndex = 0;

        // Capture the 'this' reference in a variable
        const self = this;

        function processNextCombination() {
          if (currentIndex < combinations.length) {
            const combination = combinations[currentIndex];

            // Clear all checkboxes before processing the next combination
            checkboxElements.forEach((checkbox) => {
              checkbox.checked = false;
            });

            // Check the checkboxes in the current combination
            combination.forEach((index) => {
              checkboxElements[index].checked = true;
            });

            setTimeout(() => {
              self.submitQuestion(self.activeQuestion);

              combination.forEach((index) => {
                checkboxElements[index].checked = false;
              });

              currentIndex++;
              processNextCombination();
            }, 50); // Delay of 50ms
          }
        }

        processNextCombination();
      }
    }

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
        this.activeQuestion + 1
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

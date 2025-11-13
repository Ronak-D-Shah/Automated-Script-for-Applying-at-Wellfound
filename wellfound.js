(async () => {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const waitForElement = async (selector, timeout = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
      if (el) return el;
      await delay(100);
    }
    return null;
  };

  // ✨ Generic application message
  const applicationText = `Hey there,

I'm Ronak Shah, a software engineer experienced in building scalable and reliable products end-to-end. 
I’ve worked extensively with Java, TypeScript, Spring, and React, and I enjoy creating clean, maintainable systems that make a real impact.

As a former founding engineer, I’ve handled everything from frontend and backend to DevOps — taking products from rough MVPs to stable, production-ready platforms. 
I’m passionate about solving problems, learning fast, and shipping features that delight users and drive results.

Would love to learn more about what you’re building and explore how I can contribute.

Cheers,
Ronak
https://github.com/Ronak-D-Shah
https://ronak-d-shah.github.io/Ronak-Portfolio`;

  let appliedCount = 0;
  let skippedCount = 0;
  let scrollCount = 0;
  const processedButtons = new Set();

  console.log("%c🚀 Starting smart auto-apply on Wellfound...", "color: green; font-weight: bold;");

  const handleRelocationQuestion = async () => {
    try {
      const firstRadio = document.querySelector('input[name="qualification.location.action"]');
      if (firstRadio) {
        firstRadio.click();
        console.log("%c📍 Selected relocation option", "color: orange");
      }

      const dropdownContainer = document.querySelector("#form-input--qualification.location.locationId .select__control");
      if (dropdownContainer) {
        dropdownContainer.click();
        console.log("%c🔽 Opened location dropdown", "color: orange");
        await delay(500);

        const firstOption = document.querySelector(".select__menu-list div");
        if (firstOption) {
          firstOption.click();
          console.log("%c🌍 Selected first location in dropdown", "color: orange");
        }

        await delay(2000);
        return true;
      } else {
        console.log("%c⚠️ Dropdown not found", "color: gray");
      }
    } catch (err) {
      console.log("%c❌ Error while handling relocation question", "color: red", err);
    }
    return false;
  };

  const handleCustomQuestions = () => {
    const allGroups = document.querySelectorAll('[data-test^="RadioGroup-customQuestionAnswers"]');
    allGroups.forEach((group) => {
      const options = group.querySelectorAll('input[type="radio"]');
      if (options.length === 3) {
        options[1].click();
        console.log("%c🎯 Selected Intermediate for 3-option question", "color: dodgerblue");
      } else if (options.length === 2) {
        options[0].click();
        console.log("%c🎯 Selected Beginner for 2-option question", "color: dodgerblue");
      } else {
        console.log("%c⚠️ Unexpected number of options: " + options.length, "color: gray");
      }
    });
  };

  const processBatch = async () => {
    let buttons = [...document.querySelectorAll('button[data-test="LearnMoreButton"]')];
    buttons = buttons.filter((btn) => !processedButtons.has(btn));
    if (buttons.length === 0) return false;

    for (let i = 0; i < buttons.length; i++) {
      const learnMoreBtn = buttons[i];
      processedButtons.add(learnMoreBtn);

      learnMoreBtn.scrollIntoView({ behavior: "smooth", block: "center" });
      await delay(300);
      learnMoreBtn.click();
      console.log(`%c🔍 [${appliedCount + skippedCount + 1}] Opened job modal...`, "color: blue");

      const applyBtn = await waitForElement('button[data-test="JobDescriptionSlideIn--SubmitButton"]');
      if (!applyBtn) {
        console.log("%c❌ Modal failed to load", "color: red");
        skippedCount++;
        continue;
      }

      // If apply button is disabled, handle relocation if needed
      if (applyBtn.disabled) {
        const isFormFilled = await handleRelocationQuestion();
        if (isFormFilled) {
          console.log("%c✅ Relocation questionnaire filled", "color: green");
        } else {
          console.log("%c⚠️ Apply button disabled — skipping", "color: gray");
        }

        const closeBtn = await waitForElement('button[data-test="closeButton"]');
        if (closeBtn) closeBtn.click();
        skippedCount++;
        await delay(500);
        continue;
      }

      handleCustomQuestions();

      // Step 2: Fill application text (React-safe)
      const textarea = document.querySelector("textarea:not([disabled])");
      if (textarea) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value"
        ).set;
        nativeInputValueSetter.call(textarea, applicationText);
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.dispatchEvent(new Event("change", { bubbles: true }));
        console.log("%c📝 Autofilled application", "color: purple");
      }

      await delay(1000);

      // Step 3: Click Apply
      applyBtn.click();
      console.log("%c🚀 Applying...", "color: teal");
      await delay(10000); // 10-second delay between applications

      appliedCount++;
      console.log("%c✅ Applied successfully", "color: teal");

      const closeBtn = await waitForElement('button[data-test="closeButton"]');
      if (closeBtn) {
        closeBtn.click();
        console.log("%c❎ Modal closed", "color: crimson");
      }

      await delay(1000);
    }

    return true;
  };

  const maxScrolls = 10;
  while (scrollCount < maxScrolls) {
    const found = await processBatch();
    if (!found) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      console.log("%c📜 Scrolling to load more jobs...", "color: darkcyan");
      scrollCount++;
      await delay(2000);
    } else {
      scrollCount = 0;
    }
  }

  console.log("%c🎉 All done! Smart auto-apply finished.", "color: limegreen; font-size: 16px; font-weight: bold;");
  console.log(`%c📌 Jobs Applied: ${appliedCount}`, "color: #4CAF50; font-weight: bold;");
  console.log(`%c📌 Jobs Skipped: ${skippedCount}`, "color: #FF9800; font-weight: bold;");
})();

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver');

jest.setTimeout(60000); // Increase timeout for slower connections

let driver;
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'kaushikq.ravindran@gmail.com';
const TEST_PASSWORD = 'kaushikq21';

beforeAll(async () => {
  const options = new chrome.Options();
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--window-size=1920,1080');
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

describe('Doctor Portal End-to-End Tests', () => {
  test('01 - Book Appointment', async () => {
    // Navigate to appointment page
    await driver.get(`${BASE_URL}/appointment`);
    await driver.sleep(2000);
    await driver.wait(until.elementLocated(By.className('react-calendar')), 10000);

    // Select date
    const dateCell = await driver.wait(
      until.elementLocated(By.xpath("//abbr[@aria-label='December 13, 2024']/parent::button")),
      10000
    );
    await driver.executeScript("arguments[0].click();", dateCell);
    await driver.sleep(2000);

    // Click Book Appointment
    await driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
    await driver.sleep(1000);
    
    const bookButtons = await driver.wait(
      until.elementsLocated(By.xpath("//button[contains(text(), 'Book Appointment')]")),
      10000
    );
    expect(bookButtons.length).toBeGreaterThan(0);
    await driver.executeScript("arguments[0].click();", bookButtons[0]);

    // Fill appointment form
    const nameField = await driver.wait(
      until.elementLocated(By.css("input[name='name']")),
      10000
    );
    await nameField.sendKeys("Kaushikq");

    const formFields = {
      phone: "4088295683",
      email: TEST_EMAIL,
      age: "28",
      weight: "85"
    };

    for (const [field, value] of Object.entries(formFields)) {
      const input = await driver.findElement(By.css(`input[name='${field}']`));
      await input.sendKeys(value);
    }

    // Select gender
    const genderSelect = await driver.findElement(By.css("select[name='gender']"));
    await genderSelect.sendKeys("Male");

    // Fill problem description
    const problemField = await driver.findElement(By.css("textarea[name='problem']"));
    await problemField.sendKeys("headache");

    // Submit form
    const submitButton = await driver.findElement(By.css("button[type='submit']"));
    await driver.executeScript("arguments[0].click();", submitButton);

    // Verify success
    const successMessage = await driver.wait(
      until.elementLocated(By.xpath("//h4[contains(text(), 'Appointment Request Sent!')]")),
      10000
    );
    expect(await successMessage.isDisplayed()).toBeTruthy();
  });

  test('02 - User Login', async () => {
    await driver.get(`${BASE_URL}/dashboard`);

    const emailField = await driver.wait(
      until.elementLocated(By.css("input[name='email']")),
      10000
    );
    await emailField.sendKeys(TEST_EMAIL);

    const passwordField = await driver.findElement(By.css("input[name='password']"));
    await passwordField.sendKeys(TEST_PASSWORD);

    const loginButton = await driver.findElement(By.css("button[type='submit']"));
    await loginButton.click();

    // Wait for login to complete
    await driver.sleep(3000);

    // Click on Dashboard link in nav menu
    const dashboardLink = await driver.wait(
      until.elementLocated(By.css("a.nav-link[href='/dashboard/dashboard']")),
      10000
    );
    await driver.executeScript("arguments[0].click();", dashboardLink);

    // Verify redirect with better error handling
    try {
      // Check if we're redirected
      await driver.wait(async () => {
        const currentUrl = await driver.getCurrentUrl();
        return currentUrl.includes('/dashboard/dashboard');
      }, 20000);

      // Verify dashboard content is loaded
      const dashboardHeader = await driver.wait(
        until.elementLocated(By.xpath("//h5[contains(text(), 'Dashboard')]")),
        10000
      );
      
      const isDisplayed = await dashboardHeader.isDisplayed();
      expect(isDisplayed).toBeTruthy();

    } catch (error) {
      const currentUrl = await driver.getCurrentUrl();
      console.error('Login redirect failed. Current URL:', currentUrl);
      throw error;
    }
  });

  test('03 - Verify Appointment', async () => {
    // Login first
    await driver.get(`${BASE_URL}/dashboard/my-appointment`);
    await driver.sleep(2000);
    await driver.wait(until.elementLocated(By.className('react-calendar')), 10000);

    // Select date
    const dateCell = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(@class, 'react-calendar__tile') and .//abbr[text()='13']]")),
      10000
    );
    await driver.executeScript("arguments[0].click();", dateCell);

    // Verify appointments
    await driver.wait(until.elementLocated(By.className('table')), 10000);
    const appointments = await driver.findElements(By.css('table tbody tr'));
    expect(appointments.length).toBeGreaterThan(0);
  });

  test('04 - Chat Interaction', async () => {
    await driver.get(`${BASE_URL}/dashboard/dashboard`);
    await driver.sleep(3000);

    // Open chat
    const chatTrigger = await driver.wait(
      until.elementLocated(By.className('copilotKitButton')),
      10000
    );
    await driver.executeScript("arguments[0].scrollIntoView(true);", chatTrigger);
    await chatTrigger.click();
    await driver.sleep(2000);

    // Test multilingual questions
    const chatInput = await driver.wait(
      until.elementLocated(By.css('.copilotKitInput textarea')),
      10000
    );

    const questions = [
      "Do I have any appointments on December 13?",
      "డిసెంబర్ 13న నాకు ఎలాంటి అపాయింట్‌మెంట్‌లు ఉన్నాయి?",
      "13 दिसंबर को मेरी क्या नियुक्तिया हैं?"
    ];

    for (const question of questions) {
      await chatInput.click();
      await chatInput.sendKeys(Key.CONTROL, "a");
      await chatInput.sendKeys(Key.DELETE);
      await chatInput.sendKeys(question);
      await chatInput.sendKeys(Key.RETURN);
      await driver.sleep(5000);
    }

    await driver.takeScreenshot();
  });

  test('05 - Payment Process', async () => {
    await driver.get(`${BASE_URL}/dashboard/dashboard`);
    await driver.sleep(3000);
  
    try {
      // Ensure user is logged in
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes('/dashboard/dashboard')) {
        await driver.get(`${BASE_URL}/dashboard`);
        const emailField = await driver.wait(until.elementLocated(By.css("input[name='email']")), 10000);
        const passwordField = await driver.findElement(By.css("input[name='password']"));
        const loginButton = await driver.findElement(By.css("button[type='submit']"));
        
        await emailField.sendKeys(TEST_EMAIL);
        await passwordField.sendKeys(TEST_PASSWORD);
        await loginButton.click();
  
        await driver.wait(until.urlContains('/dashboard/dashboard'), 20000);
      }
  
      // Scroll to and click the payment icon
      const paymentSection = await driver.wait(until.elementLocated(By.css(".table")), 10000);
      await driver.executeScript("arguments[0].scrollIntoView(true);", paymentSection);
      await driver.sleep(2000); // Add delay after scroll

      const paymentIcon = await driver.wait(
        until.elementLocated(By.css("td svg.text-success.ml-2[style*='cursor: pointer']")),
        10000
      );

      // Try multiple ways to click the payment icon
      try {
        await driver.wait(until.elementIsVisible(paymentIcon), 10000);
        await driver.wait(until.elementIsEnabled(paymentIcon), 10000);
        
        // Try direct click first
        try {
          await paymentIcon.click();
        } catch (clickError) {
          console.log("Direct click failed, trying JavaScript click");
          await driver.executeScript("arguments[0].click();", paymentIcon);
        }
      } catch (error) {
        console.log("Initial click attempts failed, trying alternative approach");
        
        // Alternative approach: Find parent element and click
        const parentTd = await driver.findElement(By.css("td:has(svg.text-success)"));
        await driver.executeScript("arguments[0].querySelector('svg').click();", parentTd);
      }

      await driver.sleep(2000); // Add delay after click
  
      // Wait for Stripe iframe
      const stripeIframe = await driver.wait(
        until.elementLocated(By.xpath("//iframe[contains(@src, 'https://js.stripe.com/v3/elements-inner-card')]")),
        15000
      );
      await driver.switchTo().frame(stripeIframe);
  
      // Fill card details
      const cardDetails = {
        cardnumber: "4242424242424242",
        "exp-date": "1226",
        cvc: "123",
        postal: "95113",
      };
  
      for (const [field, value] of Object.entries(cardDetails)) {
        const inputField = await driver.wait(
          until.elementLocated(By.css(`input[name='${field}']`)),
          10000
        );
        await inputField.sendKeys(value);
      }
  
      // Switch back to main content
      await driver.switchTo().defaultContent();
  
      // Click the Pay button
      const payButton = await driver.wait(
        until.elementLocated(By.css("button[type='submit'].btn-success")),
        10000
      );
      await driver.executeScript("arguments[0].scrollIntoView(true);", payButton);
      await driver.wait(until.elementIsEnabled(payButton), 10000);
      await payButton.click();
  
      // Wait for success message
      const successMessage = await driver.wait(
        until.elementLocated(By.xpath("//h4[text()='Your payment successful']")),
        20000 // Increase wait time to accommodate delays
      );
  
      expect(await successMessage.isDisplayed()).toBeTruthy();
      console.log("Payment was successful!");
  
    } catch (error) {
      console.error("Payment process failed:", error);
  
      // Take a screenshot for debugging
      const screenshot = await driver.takeScreenshot();
      const fs = require('fs');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.writeFileSync(`payment-error-${timestamp}.png`, screenshot, 'base64');
  
      // Save current page source for debugging
      const pageSource = await driver.getPageSource();
      fs.writeFileSync(`payment-error-${timestamp}.html`, pageSource);
  
      throw error;
    }
  });
      
});
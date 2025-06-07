from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver


class LoginPage:
    URL = "https://xpendless-frontend-staging-d6pkpujjuq-ww.a.run.app/login"

    EMAIL_INPUT = (By.NAME, "email")
    PASSWORD_INPUT = (By.NAME, "password")
    SUBMIT_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")
    OTP_INPUT = (By.NAME, "otp")

    def __init__(self, driver: WebDriver):
        self.driver = driver

    def load(self):
        self.driver.get(self.URL)

    def login(self, email: str, password: str):
        self.driver.find_element(*self.EMAIL_INPUT).send_keys(email)
        self.driver.find_element(*self.PASSWORD_INPUT).send_keys(password)
        self.driver.find_element(*self.SUBMIT_BUTTON).click()

    def submit_otp(self, otp: str):
        self.driver.find_element(*self.OTP_INPUT).send_keys(otp)
        self.driver.find_element(*self.SUBMIT_BUTTON).click()

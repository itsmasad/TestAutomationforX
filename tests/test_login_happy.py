import time
import pytest
from utils.driver_factory import create_driver
from pages.login_page import LoginPage
from utils.otp_helper import fetch_latest_otp

EMAIL = "Ryan_Adams1@yopmail.com"
PASSWORD = "Xpendless@A1"
INBOX = "Ryan_Adams1"


def test_login_happy():
    driver = create_driver(headless=True)
    try:
        login_page = LoginPage(driver)
        login_page.load()
        login_page.login(EMAIL, PASSWORD)

        # wait a bit for OTP to arrive
        time.sleep(5)
        otp = fetch_latest_otp(driver, INBOX)
        login_page.submit_otp(otp)

        time.sleep(2)
        assert "dashboard" in driver.current_url.lower()
    finally:
        driver.quit()

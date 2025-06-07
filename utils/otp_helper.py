import re
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver


def fetch_latest_otp(driver: WebDriver, inbox_name: str) -> str:
    inbox_url = f"https://www.yopmail.com/?{inbox_name}"
    driver.get(inbox_url)
    iframe = driver.find_element(By.ID, "ifmail")
    driver.switch_to.frame(iframe)
    body_text = driver.find_element(By.TAG_NAME, "body").text
    match = re.search(r"\b(\d{4,6})\b", body_text)
    if match:
        return match.group(1)
    raise ValueError("OTP not found in email")

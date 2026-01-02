from setuptools import setup, find_packages

setup(
    name="asset_tools",
    version="1.0.0",
    description="Asset QR label printing tools for ERPNext",
    author="Max Auto Cables Pvt Ltd",
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
)

from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in sitems/__init__.py
from sitems import __version__ as version

setup(
	name="sitems",
	version=version,
	description="sales invoice items modifications",
	author="sherif sultan",
	author_email="sheriffnasserr@gmail.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)

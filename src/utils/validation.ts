
function validate_email(email: string) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

const validateMobile = (mobile: string) => {
	return /^[6-9]\d{9}$/.test(mobile);
};

const validatePassword = (password: string) => {
	return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/.test(password);
};

export {validate_email, validateMobile, validatePassword};
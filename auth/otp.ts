export const createOtp = () => {
	const n = crypto.getRandomValues(new Uint32Array(1))

	return `${n}`.slice(0, 6).padStart(6, "0")
}

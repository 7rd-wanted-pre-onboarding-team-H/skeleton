const textEncoder = new TextEncoder()
/**
 * creates six digit otp from email
 */
export const otpFromEmail = async (email: string) => {
	const salt = crypto.getRandomValues(new Uint8Array(16))
	const encoded = textEncoder.encode(`${email}${salt}${Date.now()}`)
	const hash = await crypto.subtle.digest("SHA-256", encoded)
	const view = new DataView(hash)
	const high = view.getUint32(0)
	const low = view.getUint32(4)
	const otp = (high + low) % (10 ** 6)

	return `${otp}`.padStart(6, "0")
}

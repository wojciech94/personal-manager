import Lottie from 'lottie-react'
import animationData from '../../assets/mainloading.json'

export const LoadingAnimation = () => {
	return (
		<div className='flex justify-center items-center h-screen bg-gray-100'>
			<Lottie animationData={animationData} loop={true} className='w-64 h-64' />
		</div>
	)
}

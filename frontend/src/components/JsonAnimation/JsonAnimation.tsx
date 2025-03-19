import Lottie from 'lottie-react'

interface AnimationProps {
	data: object
}

export const JsonAnimation = ({ data }: AnimationProps) => {
	return (
		<div className='flex justify-center items-center'>
			<Lottie animationData={data} loop={true} className='w-64 h-64' />
		</div>
	)
}

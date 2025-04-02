import Lottie from 'lottie-react'

interface AnimationProps {
	data: object
}

export const JsonAnimation = ({ data }: AnimationProps) => {
	return (
		<div className='flex justify-center items-center'>
			<Lottie animationData={data} loop={true} />
		</div>
	)
}

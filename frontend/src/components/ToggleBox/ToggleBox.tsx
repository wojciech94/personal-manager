import { ReactNode, useState } from 'react'
import { Filter } from 'react-feather'
import { Button } from '../Button/Button'

export const ToggleBox = ({ children }: { children: ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className='relative'>
			<Button
				variant='light'
				className='!w-10 !h-10'
				onlyIcon={true}
				onClick={() => setIsOpen(prevState => !prevState)}>
				<Filter size={20} />
			</Button>
			{isOpen && (
				<div className='absolute mt-1 top-full r-0 flex flex-col gap-2 py-2 px-4 border border-zinc-300 rounded-md bg-white shadow-md z-50'>
					{children}
				</div>
			)}
		</div>
	)
}

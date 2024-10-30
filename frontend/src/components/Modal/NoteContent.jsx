import { useState } from 'react'

export const ModalNoteContent = ({ modalData }) => {
	const [noteName, setNoteName] = useState('')
	const [noteContent, setNoteContent] = useState('')
	const [category, setCategory] = useState('Other')

	const handleCreateNote = () => {
		if (modalData.action) {
			modalData.action(noteName, noteContent)
			reset()
		}
	}

	const reset = () => {
		setNoteName('')
		setNoteContent('')
		setCategory('Other')
	}

	return (
		<div className={`d-flex flex-column p-3 gap-2`}>
			<div className='d-flex gap-2'>
				<label htmlFor='noteName'>Note name</label>
				<input type='text' name='noteName' id='noteName' value={noteName} onChange={e => setNoteName(e.target.value)} />
			</div>
			<div className='d-flex gap-2'>
				<label htmlFor='noteContent'>Note content</label>
				<input
					type='text'
					name='noteContent'
					id='noteContent'
					value={noteContent}
					onChange={e => setNoteContent(e.target.value)}
				/>
			</div>
			<div className='d-flex gap-2'>
				<label htmlFor='noteCategory'>Note category</label>
				<input
					type='text'
					name='noteCategory'
					id='noteCategory'
					value={category}
					onChange={e => setCategory(e.target.value)}
				/>
			</div>
			<button onClick={handleCreateNote}>{modalData.actionName}</button>
		</div>
	)
}

export default function Button({onClick, children, position}: {onClick: () => void, children: React.ReactNode, position: {top: string, right: string}}) {
    return (
        <button onClick={onClick} style={{
            position: 'absolute',
            top: position.top,
            right: position.right,
            zIndex: 1000,
        }}>
            {children}
        </button>
    );
}
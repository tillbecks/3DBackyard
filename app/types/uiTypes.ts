export type ToggleButtonConfig = {
    type: 'toggle';
    onToggle: () => void;
    toggled: boolean;
    childrenToggleOn: React.ReactNode;
    childrenToggleOff: React.ReactNode;
}

export type ButtonConfig = {
    type: 'button';
    onClick: () => void;
    children: React.ReactNode;
}
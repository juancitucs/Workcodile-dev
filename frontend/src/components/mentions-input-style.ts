export default {
  control: {
    fontSize: 14,
    fontWeight: 'normal',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
  },

  '&multiLine': {
    control: {
      fontFamily: 'sans-serif',
      minHeight: 200,
    },
    highlighter: {
      padding: 12,
      wordBreak: 'break-all',
      overflowWrap: 'anywhere',
    },
    input: {
      padding: 12,
      outline: 'none',
      wordBreak: 'break-all',
      overflowWrap: 'anywhere',
    },
  },

  '&singleLine': {
    display: 'inline-block',
    width: 180,

    highlighter: {
      padding: 1,
      border: '2px inset transparent',
    },
    input: {
      padding: 1,
      border: '2px inset',
    },
  },

  suggestions: {
    list: {
      border: '1px solid hsl(var(--border))',
      fontSize: 14,
      borderRadius: '0.375rem',
      maxHeight: '200px',
      overflowY: 'auto',
      backgroundColor: 'hsl(var(--popover))', // Add background color for dark mode readability
    },
    item: {
      padding: '5px 15px',
      borderBottom: '1px solid hsl(var(--border))',
      color: 'hsl(var(--foreground))', // Ensure text color adapts

      '&focused': {
        backgroundColor: 'hsl(var(--muted))',
      },
    },
  },
}

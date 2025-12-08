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
    },
    input: {
      padding: 12,
      outline: 'none',
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
      border: '1px solid rgba(0,0,0,0.15)',
      fontSize: 14,
      borderRadius: '0.375rem',
      maxHeight: '200px',
      overflowY: 'auto',
    },
    item: {
      padding: '5px 15px',
      borderBottom: '1px solid rgba(0,0,0,0.15)',

      '&focused': {
        backgroundColor: '#f1f5f9',
      },
    },
  },
}

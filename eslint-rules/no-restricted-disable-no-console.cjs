/**
 * Custom ESLint rule to prohibit disabling the no-console rule
 * This rule checks for eslint-disable comments that target no-console
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prohibit disabling the no-console rule',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noDisableNoConsole:
        'Disabling no-console rule is not allowed. Remove console statements instead.',
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode()

    return {
      Program(node) {
        const comments = sourceCode.getAllComments()

        comments.forEach((comment) => {
          const commentText = comment.value.trim()

          // Check for eslint-disable-next-line no-console
          if (
            /eslint-disable-next-line\s+no-console/.test(commentText) ||
            /eslint-disable-line\s+no-console/.test(commentText) ||
            /eslint-disable\s+no-console/.test(commentText)
          ) {
            context.report({
              node: comment,
              messageId: 'noDisableNoConsole',
            })
          }
        })
      },
    }
  },
}


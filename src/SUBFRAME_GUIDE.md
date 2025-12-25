# Using Subframe Templates

To use a template from [Subframe](https://subframe.com) in this project:

1.  **Design your component** in Subframe.
2.  **Export the Code**:
    *   Click the **Export** button (usually in the top right).
    *   Select **React** as the framework.
    *   Select **Tailwind CSS** for styling.
    *   Ensure **TypeScript** is enabled if available.
3.  **Importing into the Project**:
    *   **Option A (Recommended)**: Create a new file in `src/components/subframe/` (e.g., `src/components/subframe/MyNewCard.tsx`) and paste the code there.
    *   **Option B**: Paste the code directly into the chat and ask me to integrate it.
4.  **Integration**:
    *   Once the code is available, tell me: *"I've added a template in `src/components/subframe/MyNewCard.tsx`, please use it to replace the Asset Card."*

## Configuration Checks
This project uses **Tailwind CSS**, so Subframe's default Tailwind export should work perfectly. Subframe may ask to add some configuration to `tailwind.config.js` (like custom colors or fonts). You can paste those instructions to me as well.

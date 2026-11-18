# Known issues in the web app

The following four issues are deferred.

| Issue                                                    | When it happens                                                                                          | What the learner sees                                                                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1. Practice answers can be lost across tabs              | Open two practice tabs before answering. Answer a different question in each, then reload the first tab. | Only the second tab’s answer is saved. Each tab writes its own copy of the full answer history.                          |
| 2. Blocked browser storage prevents startup              | Open the app in a browser that denies access to `localStorage`.                                          | The page stays blank. Startup stops before the recovery message and Retry button can appear.                             |
| 3. A failed save goes unreported                         | Answer a practice question after the browser’s storage quota has been exhausted.                         | The progress counter increases, but reloading the page loses the answer. The app gives no indication that saving failed. |
| 6. Removing another question moves the current selection | Save questions 1, 2 and 3. Select question 2, switch to list view and remove question 3.                 | Returning to card view shows question 1. The same selection error affects the Mistakes list.                             |

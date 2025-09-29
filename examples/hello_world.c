int main(void)
{
    char *HELLO_WORLD_TEXT = "Hello World!";
    int i = 0;
    int cursor = 0;

    while(HELLO_WORLD_TEXT[i] != '\0')
    {
        write_char(HELLO_WORLD_TEXT[i]);
        cursor++;
        set_cursor(cursor);
        i++;
    }
}
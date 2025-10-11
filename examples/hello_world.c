int main(void)
{
    char *TEST = "Hello World!";

    for (int i = 0; i < 12; i++)
    {
        set_cursor(i);
        write_char(TEST[i]);
    }
}